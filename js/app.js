const localStorage = window.Persistence.wrap(window.localStorage);

    // =========================================================================
    // SICHERHEITSKOMPONENTEN: KRYPTOGRAFIE & XSS FILTER
    // =========================================================================
    let NTFY_WS_URL = null, NTFY_API_URL = null;
    let cryptoKey = null;
    let decryptedVault = null;

    function currentMemoryDays() {
      const days = window.TripStore?.getDays();
      return days ? days.map(d => ({...d, day:d.dayNumber, date:d.date || '', title:d.title || '', location:d.location || d.destination || d.routeBadge || '', destination:d.destination || '', distance:d.distance || d.distanceText || '', driveTime:d.driveTime || d.duration || '', accommodation:typeof d.accommodation === 'string' ? d.accommodation : d.accommodation?.name || 'Keine Unterkunft eingetragen', activities:(d.activities || []).map(a => a.title || a.name || '')})) : TRIP_DAYS_DATA;
    }
    function liveElements(id) { return document.querySelectorAll(`[id="${id}"], [data-shared-id="${id}"]`); }
    function storageFailure(error) { window.Persistence.report(error); return false; }
    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    async function encryptPayload(plainText) {
      if (!cryptoKey) return null;
      const enc = new TextEncoder();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        cryptoKey,
        enc.encode(plainText)
      );
      const combined = new Uint8Array(iv.length + ciphertext.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(ciphertext), iv.length);
      return btoa(String.fromCharCode.apply(null, combined));
    }

    async function decryptPayload(cipherBase64) {
      if (!cryptoKey) return null;
      try {
        const binary = atob(cipherBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const iv = bytes.slice(0, 12);
        const ciphertext = bytes.slice(12);
        const decrypted = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: iv },
          cryptoKey,
          ciphertext
        );
        return new TextDecoder().decode(decrypted);
      } catch (e) {
        return null;
      }
    }

    async function verifyPin() { await restoreSession(); }
    async function restoreSession() {
      try {
        const grant = await window.AppSession.restore();
        cryptoKey = grant.key;
        decryptedVault = grant.resources;
        if (grant.syncTopic) {
          NTFY_WS_URL = `wss://ntfy.sh/${grant.syncTopic}/ws`;
          NTFY_API_URL = `https://ntfy.sh/${grant.syncTopic}`;
        }
        unlockAppUI();
      } catch (error) {
        const message = document.getElementById('gate-error');
        if (message) message.textContent = error.message;
        window.Persistence.report(error);
      }
    }

    function unlockAppUI() {
      document.body.classList.remove('is-locked');

      const gate = document.getElementById('security-gate');
      if (gate) {
        gate.style.opacity = '0';
        gate.style.pointerEvents = 'none';
        setTimeout(() => { gate.style.display = 'none'; }, 350);
      }

      // Kritische Links erst jetzt sicher im DOM setzen (nicht im HTML Quellcode vorhanden)
      if (decryptedVault) {
        const swBtn = document.getElementById('link-splitwise');
        if (swBtn && decryptedVault.splitwise) {
          swBtn.href = decryptedVault.splitwise;
          swBtn.setAttribute('rel', 'noopener noreferrer');
          swBtn.innerHTML = '<i class="fa-solid fa-arrow-right-arrow-left"></i> Splitwise Gruppe öffnen';
        }
        const swBtnBudget = document.getElementById('link-splitwise-budget');
        if (swBtnBudget && decryptedVault.splitwise) {
          swBtnBudget.href = decryptedVault.splitwise;
          swBtnBudget.setAttribute('rel', 'noopener noreferrer');
          swBtnBudget.innerHTML = '<i class="fa-solid fa-calculator"></i> Splitwise Gruppe öffnen';
        }
        liveElements('link-photos').forEach(photosBtn => {
        if (decryptedVault.photos) {
          photosBtn.href = decryptedVault.photos;
          photosBtn.setAttribute('rel', 'noopener noreferrer');
          photosBtn.innerHTML = '<i class="fa-solid fa-images"></i> Google Photos öffnen';
        }
        });
      }

      renderPhotosGallery();
      initCloudSync();
      loadUserExpenses();
      renderExpenseList();
      updateTripDashboard();
      initScrollAnimations();
      initSmoothAccordions();
      if (typeof ensureRouteMapReady === 'function') {
        setTimeout(ensureRouteMapReady, 100);
        setTimeout(ensureRouteMapReady, 400);
      }
    }


    function initScrollAnimations() {
      const dashEl = document.getElementById('dashboard');
      if (dashEl) {
        dashEl.classList.remove('scroll-tab', 'scroll-reveal');
        dashEl.classList.add('revealed');
      }
      let lastScrollY = window.scrollY;
      let scrollDirection = 'down';
      let isRafQueued = false;
      let timelineTimer = null;
      let statTimer = null;

      // Schwellenwert für Tab-Einblendung: Auf 50px verringert (nicht künstlich angehoben),
      // damit Tabs und Tage wieder leichtfüßig und prompt beim Hineinscrollen erscheinen
      const TRIGGER_OFFSET_BOTTOM = 50;
      const TRIGGER_OFFSET_TOP = 50;

      // Elemente sammeln
      const timelineDays = Array.from(document.querySelectorAll('.timeline details.timeline-item'));
      timelineDays.forEach((day, idx) => {
        day.classList.add('scroll-tab');
        day.setAttribute('data-day-idx', idx);
      });

      const statTabs = Array.from(document.querySelectorAll('.overview-stat-tab'));

      const generalSelectors = [
        '.section-title',
        '.section-lead',
        '.route-map-container-card',
        'details.clean-slide',
        'details.checkin-card',
        '.hub-card',
        '.weather-widget-card',
        '.budget-category-card',
        '.emergency-grid > div',
        '.trip-status-banner',
        '.drone-status-banner'
      ];
      const generalElements = Array.from(document.querySelectorAll(generalSelectors.join(', ')))
        .filter(el => !el.classList.contains('timeline-item') && !el.classList.contains('overview-stat-tab') && !el.closest('#view-mehr'));

      generalElements.forEach(el => {
        el.classList.add('scroll-reveal');
      });

      // 1. Sequentieller Engine für die Reiseplan-Tage:
      // Der nächste Tag darf erst geladen werden, wenn der vorherige geladen wurde!
      // Alle Tage animieren exakt gleich schnell (0.42s).
      function updateTimelineSequence() {
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const triggerBottom = vh - TRIGGER_OFFSET_BOTTOM;

        for (let i = 0; i < timelineDays.length; i++) {
          const day = timelineDays[i];
          const rect = day.getBoundingClientRect();

          if (rect.bottom < TRIGGER_OFFSET_TOP) {
            // Bereits nach oben aus dem Viewport gescrollt
            if (!day.classList.contains('revealed')) {
              day.classList.add('revealed');
              day.classList.remove('from-bottom', 'from-top');
            }
          } else if (rect.top <= triggerBottom && rect.bottom >= TRIGGER_OFFSET_TOP) {
            // Im sichtbaren Trigger-Bereich
            // WICHTIG: Nächster Tag kann erst laden, wenn der vorherige bereits geladen wurde!
            const isPrevLoaded = (i === 0) || timelineDays[i - 1].classList.contains('revealed');

            if (isPrevLoaded) {
              if (!day.classList.contains('revealed')) {
                if (scrollDirection === 'up') {
                  day.classList.add('from-top');
                  day.classList.remove('from-bottom');
                } else {
                  day.classList.add('from-bottom');
                  day.classList.remove('from-top');
                }
                day.classList.add('revealed');

                // Nächster Tag folgt im gleichmäßigen, zügigen 75ms Takt
                clearTimeout(timelineTimer);
                timelineTimer = setTimeout(() => {
                  updateTimelineSequence();
                }, 75);
                return; // Nachfolgende Tage müssen zwingend auf diesen Tag warten!
              }
            }
          } else if (rect.top > triggerBottom) {
            // Nur zurücksetzen, wenn der Tag noch gar nicht geladen war
            if (!day.classList.contains('revealed')) {
              day.classList.add('from-bottom');
              day.classList.remove('from-top');
            }
          }
        }
      }

      // 2. Sequentieller Engine für die 4 Eckdaten-Tabs
      function updateStatTabsSequence() {
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const triggerBottom = vh - TRIGGER_OFFSET_BOTTOM;

        for (let i = 0; i < statTabs.length; i++) {
          const tab = statTabs[i];
          const rect = tab.getBoundingClientRect();

          if (rect.bottom < TRIGGER_OFFSET_TOP) {
            if (!tab.classList.contains('revealed')) {
              tab.classList.add('revealed');
              tab.classList.remove('from-bottom', 'from-top');
            }
          } else if (rect.top <= triggerBottom && rect.bottom >= TRIGGER_OFFSET_TOP) {
            const isPrevLoaded = (i === 0) || statTabs[i - 1].classList.contains('revealed');
            if (isPrevLoaded) {
              if (!tab.classList.contains('revealed')) {
                if (scrollDirection === 'up') {
                  tab.classList.add('from-top');
                  tab.classList.remove('from-bottom');
                } else {
                  tab.classList.add('from-bottom');
                  tab.classList.remove('from-top');
                }
                tab.classList.add('revealed');

                clearTimeout(statTimer);
                statTimer = setTimeout(() => {
                  updateStatTabsSequence();
                }, 65);
                return;
              }
            } else {
              tab.classList.remove('revealed');
            }
          } else if (rect.top > triggerBottom) {
            tab.classList.remove('revealed');
            tab.classList.add('from-bottom');
            tab.classList.remove('from-top');
          }
        }
      }

      // 3. Allgemeine Karten & Infoboxen (gleichmäßige 0.42s Animation)
      function updateGeneralElements() {
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const triggerBottom = vh - TRIGGER_OFFSET_BOTTOM;

        generalElements.forEach(el => {
          const rect = el.getBoundingClientRect();
          const isMapCard = el.classList.contains('route-map-container-card');

          if (rect.top <= triggerBottom && rect.bottom >= TRIGGER_OFFSET_TOP) {
            if (!el.classList.contains('revealed')) {
              if (scrollDirection === 'up') {
                el.classList.add('from-top');
                el.classList.remove('from-bottom');
              } else {
                el.classList.add('from-bottom');
                el.classList.remove('from-top');
              }
              el.classList.add('revealed');
              if (isMapCard && typeof ensureRouteMapReady === 'function') {
                setTimeout(ensureRouteMapReady, 60);
                setTimeout(ensureRouteMapReady, 380);
              }
            } else if (isMapCard && routeInteractiveMap) {
              routeInteractiveMap.invalidateSize({ pan: false });
            }
          } else if (rect.top > triggerBottom) {
            if (!isMapCard) {
              el.classList.remove('revealed');
              el.classList.add('from-bottom');
              el.classList.remove('from-top');
            }
          } else if (rect.bottom < TRIGGER_OFFSET_TOP) {
            // WICHTIG: Die Karten-Card verliert NICHT ihr revealed beim Weiterscrollen!
            // Verhindert Flackern/Verzögerung und weisse Flächen beim Zurückscrollen.
            if (!isMapCard) {
              el.classList.remove('revealed');
              el.classList.add('from-top');
              el.classList.remove('from-bottom');
            }
          }
        });
      }

      function runScrollCheck() {
        updateTimelineSequence();
        updateStatTabsSequence();
        updateGeneralElements();
        isRafQueued = false;
      }

      function requestScrollCheck() {
        if (!isRafQueued) {
          isRafQueued = true;
          requestAnimationFrame(runScrollCheck);
        }
      }

      // Scroll-Listener mit Richtungserkennung
      window.addEventListener('scroll', () => {
        const curY = window.scrollY;
        if (curY > lastScrollY + 2) {
          scrollDirection = 'down';
        } else if (curY < lastScrollY - 2) {
          scrollDirection = 'up';
        }
        lastScrollY = curY;
        requestScrollCheck();
      }, { passive: true });

      window.addEventListener('resize', requestScrollCheck, { passive: true });

      // Initialer Check beim Start
      runScrollCheck();
    }

    // =========================================================================
    // SANFTE, VERZÖGERTE AKKORDEON-ANIMATION FÜR ALLE AUFKLAPPBAREN MENÜS
    // =========================================================================
    function initSmoothAccordions() {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Flüssige max-height Transition für .day-plan-accordion beim Zuklappen ohne Layout-Jumping
      document.querySelectorAll('details.day-plan-accordion').forEach((details) => {
        if (details._smoothDayPlanAttached) return;
        details._smoothDayPlanAttached = true;
        const summary = details.querySelector('summary.day-plan-summary');
        const content = details.querySelector('.day-plan-content');
        if (!summary || !content) return;

        let isCollapsing = false;
        summary.addEventListener('click', (e) => {
          if (prefersReduced) return;
          if (details.open) {
            if (isCollapsing) return;
            e.preventDefault();
            isCollapsing = true;

            const currentH = content.scrollHeight;
            content.style.maxHeight = currentH + 'px';
            content.style.opacity = '1';
            content.style.animation = 'none';
            void content.offsetHeight; // force reflow

            content.style.transition = 'max-height 0.38s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, padding 0.38s cubic-bezier(0.4, 0, 0.2, 1)';
            content.style.maxHeight = '0px';
            content.style.opacity = '0';
            content.style.paddingTop = '0px';
            content.style.paddingBottom = '0px';

            setTimeout(() => {
              details.open = false;
              content.style.maxHeight = '';
              content.style.opacity = '';
              content.style.paddingTop = '';
              content.style.paddingBottom = '';
              content.style.transition = '';
              content.style.animation = '';
              isCollapsing = false;
            }, 390);
          }
        });
      });

      document.querySelectorAll('details').forEach((details) => {
        if (details.classList.contains('day-plan-accordion')) return;
        if (details._smoothAccordionAttached) return;
        details._smoothAccordionAttached = true;

        const summary = details.querySelector('summary');
        if (!summary) return;

        let content = null;
        for (let i = 0; i < details.children.length; i++) {
          if (details.children[i] !== summary) {
            content = details.children[i];
            break;
          }
        }
        if (!content) return;

        let isAnimating = false;
        let currentAnimation = null;

        summary.addEventListener('click', (e) => {
          if (prefersReduced) return;
          e.preventDefault();

          if (isAnimating && currentAnimation) {
            currentAnimation.cancel();
          }

          const isTimeline = details.classList.contains('timeline-item');
          const animTarget = isTimeline ? content : details;

          if (details.open) {
            // Zuklappen
            isAnimating = true;
            details.classList.add('is-collapsing');
            details.classList.remove('is-expanding');

            if (isTimeline) {
              const startH = content.offsetHeight;
              content.style.overflow = 'hidden';
              currentAnimation = content.animate(
                [
                  { height: `${startH}px`, opacity: 1 },
                  { height: '0px', opacity: 0 }
                ],
                { duration: 320, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' }
              );
            } else {
              const startH = details.offsetHeight;
              const endH = summary.offsetHeight;
              currentAnimation = details.animate(
                [
                  { height: `${startH}px`, opacity: 1 },
                  { height: `${endH}px`, opacity: 0.96 }
                ],
                { duration: 320, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' }
              );
            }

            currentAnimation.onfinish = () => {
              details.open = false;
              details.classList.remove('is-collapsing');
              animTarget.style.height = '';
              animTarget.style.overflow = '';
              isAnimating = false;
              currentAnimation = null;
              details.dispatchEvent(new Event('toggle'));

              // Sofortigen ScrollCheck ausführen, damit nachfolgende Tage nicht verschwinden!
              if (typeof runScrollCheck === 'function') {
                runScrollCheck();
              }
            };
          } else {
            // Aufklappen
            isAnimating = true;
            details.open = true;
            details.classList.add('is-expanding');
            details.classList.remove('is-collapsing');

            // Stagger-Index für Unterkarten zuweisen
            const subcards = content.querySelectorAll('.day-subcard, .checkin-grid > div');
            subcards.forEach((sc, idx) => {
              sc.style.setProperty('--item-idx', idx);
            });

            if (isTimeline) {
              content.style.height = 'auto';
              content.style.overflow = 'hidden';
              const naturalH = content.offsetHeight;
              content.style.height = '0px';

              currentAnimation = content.animate(
                [
                  { height: '0px', opacity: 0 },
                  { height: `${naturalH}px`, opacity: 1 }
                ],
                { duration: 420, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
              );
            } else {
              const startH = summary.offsetHeight;
              details.style.height = 'auto';
              const naturalH = details.offsetHeight;
              details.style.height = `${startH}px`;

              currentAnimation = details.animate(
                [
                  { height: `${startH}px` },
                  { height: `${naturalH}px` }
                ],
                { duration: 420, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
              );
            }

            currentAnimation.onfinish = () => {
              animTarget.style.height = '';
              animTarget.style.overflow = '';
              details.classList.remove('is-expanding');
              isAnimating = false;
              currentAnimation = null;
              details.dispatchEvent(new Event('toggle'));

              if (details.id === 'budget-details-slide') {
                setTimeout(renderCurrentBudgetChart, 60);
              }
              if (typeof runScrollCheck === 'function') {
                runScrollCheck();
              }
            };
          }
        });
      });
    }

    // =========================================================================
    // SYNCHRONISATION MIT VERSCHLÜSSELUNG
    // =========================================================================
    const GROCERY_STORAGE_KEY = 'aus_roadtrip_groceries_2027';
    const CHECKBOX_STORAGE_KEY = 'aus_roadtrip_checkboxes_2027';
    const FUEL_STORAGE_KEY = 'aus_roadtrip_fuel_entries_2027';
    const SUGGESTIONS_STORAGE_KEY = 'aus_roadtrip_suggestions_2027';

    let groceries = [];
    let checkboxStates = {};
    let fuelEntries = [];
    let daySuggestions = {};
    let currentSelectedTz = 'Australia/Sydney';
    let currentAudToEurRate = 0.6209;
    let syncSocket = null;
    let isApplyingRemote = false;

    function initCloudSync() {
      if (!navigator.onLine || !cryptoKey || !NTFY_API_URL) return;
      try {
        if (syncSocket && syncSocket.readyState === WebSocket.OPEN) return;
        syncSocket = new WebSocket(NTFY_WS_URL);
        syncSocket.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.event === 'message' && data.message) {
              const plainJson = await decryptPayload(data.message);
              if (plainJson) handleRemoteUpdate(JSON.parse(plainJson));
            }
          } catch (e) { }
        };
        syncSocket.onclose = () => {
          if (navigator.onLine) {
            setTimeout(initCloudSync, 5000);
          }
        };
      } catch (e) { }

      fetch(`${NTFY_API_URL}/json?poll=1&since=all`)
        .then(res => res.text())
        .then(async text => {
          if (!text) return;
          const lines = text.trim().split('\n');
          for (let i = lines.length - 1; i >= 0; i--) {
            try {
              const parsed = JSON.parse(lines[i]);
              if (parsed.event === 'message' && parsed.message) {
                const plainJson = await decryptPayload(parsed.message);
                if (plainJson) {
                  handleRemoteUpdate(JSON.parse(plainJson));
                  break;
                }
              }
            } catch (e) { }
          }
        }).catch(() => { });
    }

    function handleRemoteUpdate(payload) {
      if (!payload || !Number.isFinite(payload.timestamp)) return;
      const accepted = Number(localStorage.getItem('aus_sync_accepted_v2') || 0);
      if (payload.timestamp <= accepted || payload.timestamp < Number(localStorage.getItem('aus_sync_local_v2') || 0)) return;
      const fields = [['groceries',GROCERY_STORAGE_KEY,groceries],['fuelEntries',FUEL_STORAGE_KEY,fuelEntries],['checkboxStates',CHECKBOX_STORAGE_KEY,checkboxStates],['daySuggestions',SUGGESTIONS_STORAGE_KEY,daySuggestions],['customActivities',CUSTOM_ACTIVITIES_KEY,getCustomActivities()]];
      if (fields.some(([key]) => payload[key] == null || typeof payload[key] !== 'object')) return;
      if (!Array.isArray(payload.groceries) || !Array.isArray(payload.fuelEntries) || payload.groceries.some(x=>!x || typeof x.text!=='string') || payload.fuelEntries.some(x=>!x || !Number.isFinite(Number(x.costAud)))) return;
      const differs = fields.some(([key,,value]) => JSON.stringify(payload[key]) !== JSON.stringify(value));
      if (!differs) { localStorage.setItem('aus_sync_accepted_v2',payload.timestamp); return; }
      const hasLocal = fields.some(([,,value]) => Object.keys(value).length > 0);
      // Retain both versions before asking; cancelled conflicts never replace local data.
      localStorage.setItem('aus_sync_received_v2', JSON.stringify(payload));
      if (hasLocal && !window.confirm('Es gibt abweichende Gruppendaten. Möchtest du die empfangene Version übernehmen? Deine aktuelle Version wird vorher lokal gesichert.')) return;
      localStorage.setItem('aus_sync_backup_v2', JSON.stringify(Object.fromEntries(fields.map(([key,,value])=>[key,value]))));
      isApplyingRemote = true;
      try {
        // Check all storage writes before updating the UI. A failed write stays visible as an error.
        localStorage.batch([...fields.map(([key,storageKey]) => [storageKey,JSON.stringify(payload[key])]),['aus_sync_accepted_v2',String(payload.timestamp)]]);
        groceries=payload.groceries;fuelEntries=payload.fuelEntries;checkboxStates=payload.checkboxStates;daySuggestions=payload.daySuggestions;
        renderGroceries();renderFuel();applyCheckboxStatesToUI();applySubItemsPaidStateToUI();renderAllSuggestions();renderCustomActivities();updateBudgetCalculations();
      } catch(error) { storageFailure(error); }
      finally { isApplyingRemote=false; }
    }

    async function broadcastState() {
      if (isApplyingRemote) return;

      const rawPayload = JSON.stringify({
        groceries: groceries,
        fuelEntries: fuelEntries,
        checkboxStates: checkboxStates,
        daySuggestions: daySuggestions,
        customActivities: getCustomActivities(),
        tz: currentSelectedTz,
        timestamp: Date.now()
      });

      localStorage.batch([[GROCERY_STORAGE_KEY,JSON.stringify(groceries)],[FUEL_STORAGE_KEY,JSON.stringify(fuelEntries)],[CHECKBOX_STORAGE_KEY,JSON.stringify(checkboxStates)],[SUGGESTIONS_STORAGE_KEY,JSON.stringify(daySuggestions)],['aus_sync_local_v2',String(Date.now())]]);
      if (!cryptoKey || !NTFY_API_URL || !navigator.onLine) { updateBudgetCalculations(); return; }
      const encryptedCipher = await encryptPayload(rawPayload);
      if (encryptedCipher) {
        fetch(NTFY_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: encryptedCipher
        }).catch(() => { });
      }

      updateBudgetCalculations();
    }

    // VORSCHLÄGE
    function triggerAddSuggestion(dayKey, btnEl) {
      const container = btnEl.closest('.sug-input-row');
      const input = container.querySelector('.sug-text-input');
      const select = container.querySelector('.sug-author-select');
      addSuggestion(dayKey, input, select);
    }

    function addSuggestion(dayKey, inputEl, selectEl) {
      if (!inputEl) return;
      const text = inputEl.value.trim();
      if (!text) return;

      if (!selectEl) selectEl = inputEl.parentElement.querySelector('.sug-author-select');
      const author = selectEl ? selectEl.value : 'Tobi';

      if (!daySuggestions[dayKey]) daySuggestions[dayKey] = [];
      daySuggestions[dayKey].push({ id: Date.now(), text: text, author: author });

      inputEl.value = '';
      renderSuggestionsForDay(dayKey);
      broadcastState();
    }

    function deleteSuggestion(dayKey, id) {
      if (!daySuggestions[dayKey]) return;
      daySuggestions[dayKey] = daySuggestions[dayKey].filter(item => item.id !== id);
      renderSuggestionsForDay(dayKey);
      broadcastState();
    }

    function renderAllSuggestions() {
      document.querySelectorAll('.day-subcard.suggestions').forEach(el => {
        const day = el.getAttribute('data-day');
        if (day) renderSuggestionsForDay(day);
      });
    }

    function renderSuggestionsForDay(dayKey) {
      const listEl = document.getElementById(`sug-list-${dayKey}`);
      if (!listEl) return;
      listEl.innerHTML = '';

      const items = daySuggestions[dayKey] || [];
      if (items.length === 0) {
        listEl.innerHTML = `<li style="font-size: 0.8rem; font-style: italic">Noch keine Vorschläge vorhanden.</li>`;
        return;
      }

      items.forEach(item => {
        const li = document.createElement('li');
        li.className = 'sug-item';
        const payerClass = item.author ? item.author.toLowerCase() : 'tobi';
        li.innerHTML = `
          <div>
            <span class="payer-badge ${payerClass}">${escapeHtml(item.author)}</span>
            <span>${escapeHtml(item.text)}</span>
          </div>
          <button class="sug-del-btn" onclick="deleteSuggestion('${dayKey}', ${item.id})" title="Entfernen"><i class="fa-solid fa-xmark"></i></button>
        `;
        listEl.appendChild(li);
      });
    }

    // EINKAUFSZETTEL
    function addGroceryItem() {
      const input = document.getElementById('grocery-item-input');
      const priceInput = document.getElementById('grocery-price-aud');
      const payerSelect = document.getElementById('grocery-payer');

      const text = input.value.trim();
      if (!text) return;

      const priceAud = parseFloat(priceInput.value) || 0;
      groceries.unshift({
        id: Date.now(),
        text: text,
        priceAud: priceAud,
        priceEur: priceAud * currentAudToEurRate,
        exchangeRate: currentAudToEurRate,
        payer: priceAud > 0 ? payerSelect.value : null,
        done: false
      });

      input.value = '';
      priceInput.value = '';
      renderGroceries();
      broadcastState();
    }

    function quickAddGrocery(text) {
      if (!groceries.some(g => g.text.toLowerCase() === text.toLowerCase())) {
        groceries.unshift({ id: Date.now(), text: text, priceAud: 0, priceEur: 0, done: false });
        renderGroceries();
        broadcastState();
      }
    }

    function toggleGrocery(index) {
      if (groceries[index]) {
        groceries[index].done = !groceries[index].done;
        renderGroceries();
        broadcastState();
      }
    }

    function deleteGrocery(index) {
      groceries.splice(index, 1);
      renderGroceries();
      broadcastState();
    }

    function renderGroceries() {
      const container = document.getElementById('grocery-list-container');
      if (!container) return;
      container.innerHTML = '';

      let payerTotals = { Tobi: 0, Lara: 0, Ker: 0, Flo: 0 };

      groceries.forEach((item, index) => {
        const priceAud = item.priceAud || 0;
        const priceEur = item.exchangeRate ? priceAud * item.exchangeRate : priceAud * currentAudToEurRate;
        if (priceAud > 0 && item.payer && payerTotals[item.payer === 'Kerstin' ? 'Ker' : item.payer] !== undefined) {
          payerTotals[item.payer === 'Kerstin' ? 'Ker' : item.payer] += priceEur;
        }

        const li = document.createElement('li');
        li.className = `glass-row-item grocery-item ${item.done ? 'completed' : ''}`;
        li.innerHTML = `
          <div style="cursor:pointer; display:flex; align-items:center; gap:0.6rem" onclick="toggleGrocery(${index})">
            <input type="checkbox" ${item.done ? 'checked' : ''} style="pointer-events:none">
            <span>${escapeHtml(item.text)} ${priceAud > 0 ? `<small>(${(window.FinanceView?.amount(priceAud) ?? priceAud).toFixed(2)} AUD)</small>` : ''}</span>
          </div>
          <button class="grocery-del-btn" onclick="deleteGrocery(${index})"><i class="fa-solid fa-trash-can"></i></button>
        `;
        container.appendChild(li);
      });

      document.getElementById('grocery-tobi-sum').innerText = `${payerTotals.Tobi.toFixed(2)} €`;
      document.getElementById('grocery-lara-sum').innerText = `${payerTotals.Lara.toFixed(2)} €`;
      document.getElementById('grocery-ker-sum').innerText = `${payerTotals.Ker.toFixed(2)} €`;
      document.getElementById('grocery-flo-sum').innerText = `${payerTotals.Flo.toFixed(2)} €`;
    }

    // =========================================================================
    // SPRITRECHNER & TANKBELEGE (LIVE-SYNC & KOSTENTEILUNG DURCH 4)
    // =========================================================================
    function renderFuel() {
      const container = document.getElementById('fuel-list-container');
      if (!container) return;
      container.innerHTML = '';

      let payerTotalsEur = { Ker: 0, Tobi: 0, Flo: 0, Lara: 0 };
      let payerTotalsAud = { Ker: 0, Tobi: 0, Flo: 0, Lara: 0 };
      let totalAud = 0;
      let totalEur = 0;

      fuelEntries.forEach((entry, index) => {
        const costAud = parseFloat(entry.costAud) || 0;
        const costEur = parseFloat(entry.costEur) || (costAud * currentAudToEurRate);
        totalAud += costAud;
        totalEur += costEur;

        const payer = entry.payer || 'Tobi';
        if (payerTotalsEur[payer] !== undefined) {
          payerTotalsEur[payer] += costEur;
          payerTotalsAud[payer] += costAud;
        }

        const card = document.createElement('div');
        card.className = 'glass-row-item fuel-entry-card';
        card.style.marginBottom = '8px';

        const payerClass = payer.toLowerCase();
        const dateStr = entry.date || new Date(entry.id || Date.now()).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
        const locationStr = entry.location ? ` • ${escapeHtml(entry.location)}` : '';

        card.innerHTML = `
          <div style="display: flex; align-items: center; gap: 0.6rem; flex: 1; min-width: 0">
            <span class="payer-badge ${payerClass}">${escapeHtml(payer)}</span>
            <div style="min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
              <div style="font-weight: 700; font-size: 0.95rem">
                ${(window.FinanceView?.amount(costAud) ?? costAud).toFixed(2)} AUD <span style="font-size: 0.82rem; font-weight: 600">(≈ ${(window.FinanceView?.amount(costEur) ?? costEur).toFixed(2)} €)</span>
              </div>
              <div style="font-size: 0.75rem; overflow: hidden; text-overflow: ellipsis">
                ${escapeHtml(dateStr)}${locationStr}
              </div>
            </div>
          </div>
          <button class="fuel-del-btn" style="border: none; cursor: pointer; padding: 0.4rem 0.55rem; font-size: 1rem; opacity: 0.75" onclick="deleteFuelEntry(${index})" title="Löschen">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        `;
        container.appendChild(card);
      });

      if (fuelEntries.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 1.2rem; font-size: 0.84rem; border-radius: 12px">
            <i class="fa-solid fa-gas-pump" style="font-size: 1.5rem; margin-bottom: 0.4rem; opacity: 0.5; display: block"></i>
            Noch keine Tankfüllungen eingetragen. Tragt jede Tankung ein – sie synchronisiert sich live über alle Handys und teilt fair durch 4!
          </div>
        `;
      }

      // Update counters & totals
      const countEl = document.getElementById('fuel-entry-count');
      if (countEl) countEl.innerText = `${fuelEntries.length} ${fuelEntries.length === 1 ? 'Eintrag' : 'Einträge'}`;

      const totalSumEl = document.getElementById('fuel-total-sum');
      if (totalSumEl) totalSumEl.innerText = `${(window.FinanceView?.amount(totalAud) ?? totalAud).toFixed(2)} AUD (${(window.FinanceView?.amount(totalEur) ?? totalEur).toFixed(2)} €)`;

      const perPersonEl = document.getElementById('fuel-per-person');
      if (perPersonEl) perPersonEl.innerText = `${(totalAud / 4).toFixed(2)} AUD (${(totalEur / 4).toFixed(2)} €)`;

      // Update individual payer sums
      ['ker', 'tobi', 'flo', 'lara'].forEach(key => {
        const pName = key.charAt(0).toUpperCase() + key.slice(1);
        const sumEl = document.getElementById(`fuel-${key}-sum`);
        if (sumEl) sumEl.innerText = `${payerTotalsEur[pName].toFixed(2)} €`;
        const audEl = document.getElementById(`fuel-${key}-aud`);
        if (audEl) audEl.innerText = `${payerTotalsAud[pName].toFixed(2)} AUD`;
      });
    }

    function addFuelEntry() {
      const costAudInput = document.getElementById('fuel-cost-aud');
      const payerSelect = document.getElementById('fuel-payer');
      const locationInput = document.getElementById('fuel-location');
      if (!costAudInput) return;

      const costAud = parseFloat(costAudInput.value);
      if (isNaN(costAud) || costAud <= 0) {
        costAudInput.focus();
        return;
      }

      const payer = payerSelect ? payerSelect.value : 'Tobi';
      const location = locationInput ? locationInput.value.trim() : '';
      const now = new Date();
      const dateStr = now.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

      const newEntry = {
        id: Date.now(),
        date: dateStr,
        costAud: costAud,
        costEur: costAud * currentAudToEurRate,
        payer: payer,
        location: location
      };

      fuelEntries.unshift(newEntry);
      costAudInput.value = '';
      if (locationInput) locationInput.value = '';
      updateFuelEurPreview();

      renderFuel();
      broadcastState();
      updateBudgetCalculations();
    }

    function setFuelAmount(val) {
      const costAudInput = document.getElementById('fuel-cost-aud');
      if (costAudInput) {
        costAudInput.value = val;
        updateFuelEurPreview();
      }
    }

    function updateFuelEurPreview() {
      const costAudInput = document.getElementById('fuel-cost-aud');
      const previewEl = document.getElementById('fuel-eur-preview');
      if (!costAudInput || !previewEl) return;
      const val = parseFloat(costAudInput.value) || 0;
      if (val > 0) {
        const eur = (val * currentAudToEurRate).toFixed(2).replace('.', ',');
        const perPerson = ((val * currentAudToEurRate) / 4).toFixed(2).replace('.', ',');
        previewEl.innerHTML = `Entspricht ca. <strong>${eur} €</strong> (${perPerson} € p.P. • Kurs: 1 AUD ≈ ${currentAudToEurRate.toFixed(4).replace('.', ',')} €)`;
      } else {
        previewEl.innerHTML = `Entspricht ca. 0,00 € (Kurs: 1 AUD ≈ ${currentAudToEurRate.toFixed(4).replace('.', ',')} €) • Wird fair durch 4 geteilt`;
      }
    }

    function deleteFuelEntry(index) {
      fuelEntries.splice(index, 1);
      renderFuel();
      broadcastState();
      updateBudgetCalculations();
    }

    // THEME & CORE
    function updateThemeUI(isDark) {
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      const topBtn = document.getElementById('theme-toggle-btn');
      if (topBtn) {
        topBtn.setAttribute('aria-pressed', String(isDark));
        topBtn.setAttribute('aria-label', isDark ? 'Light Mode aktivieren' : 'Dark Mode aktivieren');
        topBtn.innerHTML = isDark ? '<i class="fa-solid fa-sun" style=""></i>' : '<i class="fa-solid fa-moon"></i>';
      }
      const drawerIcon = document.getElementById('drawer-theme-icon');
      const drawerLabel = document.getElementById('drawer-theme-label');
      if (drawerIcon) {
        drawerIcon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        drawerIcon.style.color = isDark ? 'var(--accent-gold)' : '';
      }
      if (drawerLabel) {
        drawerLabel.textContent = isDark ? 'Light Mode aktivieren' : 'Dark Mode aktivieren';
      }
    }

    function initTheme() {
      let isDark = false;
      try { isDark = window.localStorage.getItem('aus_theme') === 'dark'; } catch (e) { console.warn('Theme konnte nicht geladen werden.', e); }
      document.body.classList.toggle('dark-theme', isDark);
      updateThemeUI(isDark);
    }

    function toggleDarkMode() {
      const isDark = document.body.classList.toggle('dark-theme');
      updateThemeUI(isDark);
      // Preferences may change independently in another tab; keep data conflict guards intact.
      try { window.localStorage.setItem('aus_theme', isDark ? 'dark' : 'light'); } catch (e) { console.warn('Theme konnte nicht gespeichert werden.', e); }
    }

    // =========================================================================
    // TRIP DAYS DATA (20 TAGE VOLLSTÄNDIG VERKNÜPFT MIT ROUTEN & KOORDINATEN)
    // =========================================================================
    const TRIP_DAYS_DATA = [
      {
        day: 1,
        date: '21.03. (So)',
        title: 'Abreise aus Wien',
        location: 'Wien → Sydney (Langstreckenflug)',
        start: 'Flughafen Wien-Schwechat (VIE)',
        destination: 'Sydney Kingsford Smith Airport (SYD)',
        startCoords: [48.1103, 16.5697],
        destCoords: [-33.9461, 151.1772],
        center: [-33.8688, 151.2093],
        zoom: 6,
        distance: 'ca. 15.900 km',
        driveTime: 'ca. 22–24 Std. Flugzeit',
        transportType: 'flight',
        accommodation: 'Langstreckenflug (Übernachtung an Bord / Flugzeug)',
        stageRoute: [[-33.9461, 151.1772], [-33.8688, 151.2093]],
        activities: ['Abreise aus Wien', 'Langstreckenflug über Singapur (SIN)', 'Zwischenstopp 3h 15m'],
        spotIds: []
      },
      {
        day: 2,
        date: '22.03. (Mo)',
        title: 'Ankunft in Sydney',
        location: 'Sydney (NSW)',
        start: 'Kingsford Smith Airport (SYD)',
        destination: 'The Ultimo Sydney (Chinatown / Haymarket)',
        startCoords: [-33.9461, 151.1772],
        destCoords: [-33.8807, 151.2034],
        center: [-33.875, 151.202],
        zoom: 13,
        distance: 'ca. 12 km',
        driveTime: 'ca. 25 Min. Transfer',
        transportType: 'drive',
        accommodation: 'The Ultimo, Sydney (50 Jones St, Ultimo NSW 2007)',
        stageRoute: [[-33.9461, 151.1772], [-33.9100, 151.1850], [-33.8807, 151.2034], [-33.8695, 151.2010]],
        activities: ['Landung 18:50 Uhr', 'Flughafentransfer', 'Hotel Check-in', 'Abendessen Darling Harbour & Barangaroo'],
        spotIds: [1]
      },
      {
        day: 3,
        date: '23.03. (Di)',
        title: 'Sydney – Klassiker am Hafen & Manly Ferry',
        location: 'Sydney (NSW)',
        start: 'The Ultimo Sydney',
        destination: 'Circular Quay & Manly Beach',
        startCoords: [-33.8807, 151.2034],
        destCoords: [-33.7990, 151.2840],
        center: [-33.845, 151.235],
        zoom: 12,
        distance: 'ca. 11 km Fähre',
        driveTime: 'ca. 20–30 Min. ÖPNV / Fähre',
        transportType: 'transit',
        accommodation: 'The Ultimo, Sydney',
        stageRoute: [[-33.8807, 151.2034], [-33.8590, 151.2085], [-33.8585, 151.2185], [-33.8400, 151.2500], [-33.7990, 151.2840]],
        activities: ['Sydney Opera House', 'Mrs Macquarie’s Chair', 'The Rocks & Harbour Bridge Pylon Walk', 'Manly Ferry'],
        spotIds: [2, 3]
      },
      {
        day: 4,
        date: '24.03. (Mi)',
        title: 'Sydney – Coastal Walk & Trendviertel',
        location: 'Sydney (NSW)',
        start: 'The Ultimo Sydney',
        destination: 'Bondi Beach & Surry Hills',
        startCoords: [-33.8807, 151.2034],
        destCoords: [-33.8915, 151.2767],
        center: [-33.885, 151.240],
        zoom: 13,
        distance: 'ca. 15 km ÖPNV / 6 km Walk',
        driveTime: 'ca. 25 Min. Bus',
        transportType: 'transit',
        accommodation: 'The Ultimo, Sydney',
        stageRoute: [[-33.8807, 151.2034], [-33.8860, 151.2135], [-33.8880, 151.2500], [-33.8915, 151.2767], [-33.9200, 151.2580]],
        activities: ['Bondi to Coogee Coastal Walk', 'Bondi Icebergs Pool', 'Surry Hills Cafékultur (Crown St)', 'Paddington Boutiquen'],
        spotIds: [4, 5]
      },
      {
        day: 5,
        date: '25.03. (Do)',
        title: 'Flug nach Ballina / Byron Bay',
        location: 'Sydney → Byron Bay / Ballina (NSW)',
        start: 'Sydney Kingsford Smith Airport (SYD)',
        destination: 'Cape Byron Lighthouse & East Ballina',
        startCoords: [-33.9461, 151.1772],
        destCoords: [-28.6384, 153.6366],
        center: [-28.750, 153.600],
        zoom: 10,
        distance: 'ca. 610 km Flug + 30 km Mietwagen',
        driveTime: 'ca. 1 Std. 15 Min. Flug + 25 Min. Fahrt',
        transportType: 'flight',
        accommodation: 'AirBnB, East Ballina (East Ballina, NSW)',
        stageRoute: [[-33.9461, 151.1772], [-28.8340, 153.5620], [-28.8650, 153.5850], [-28.6384, 153.6366]],
        activities: ['Flug SYD → BNK', 'Mietwagenübernahme Ballina', 'Cape Byron Lighthouse (östlichster Festlandpunkt)'],
        spotIds: [6]
      },
      {
        day: 6,
        date: '26.03. (Fr)',
        title: 'Byron Bay & Erlebnisse am Ozean',
        location: 'Byron Bay (NSW)',
        start: 'AirBnB East Ballina',
        destination: 'Wategos Beach & The Pass (Byron Bay)',
        startCoords: [-28.8650, 153.5850],
        destCoords: [-28.6360, 153.6280],
        center: [-28.640, 153.625],
        zoom: 12,
        distance: 'ca. 30 km (je Richtung)',
        driveTime: 'ca. 25 Min. Fahrt',
        transportType: 'drive',
        accommodation: 'AirBnB, East Ballina',
        stageRoute: [[-28.8650, 153.5850], [-28.7000, 153.5900], [-28.6430, 153.6120], [-28.6360, 153.6280]],
        activities: ['Kajaktour mit Delfinen & Schildkröten', 'Wategos Beach & The Pass', 'Beach Hotel Live-Musik'],
        spotIds: [7]
      },
      {
        day: 7,
        date: '27.03. (Sa)',
        title: 'Byron Bay → Gold Coast → Brisbane',
        location: 'Byron Bay → Gold Coast → Brisbane (NSW/QLD)',
        start: 'Byron Bay',
        destination: 'Hotel Rambla at Story House (Brisbane)',
        startCoords: [-28.6430, 153.6120],
        destCoords: [-27.4850, 153.0330],
        center: [-28.050, 153.300],
        zoom: 9,
        distance: 'ca. 175 km',
        driveTime: 'ca. 2,5 Std. Fahrtzeit',
        transportType: 'drive',
        accommodation: 'Rambla at Story House, Brisbane (Woolloongabba / Kangaroo Point)',
        stageRoute: [
          [-28.6430, 153.6120],
          [-28.1667, 153.5333],
          [-28.0933, 153.4560],
          [-27.9667, 153.4000],
          [-27.4850, 153.0330],
          [-27.4608, 153.0360]
        ],
        activities: ['Burleigh Heads Lookout & Gold Coast Skyline', 'Fahrt über den Pacific Motorway', 'Howard Smith Wharves & Story Bridge'],
        spotIds: [8, 9]
      },
      {
        day: 8,
        date: '28.03. (So)',
        title: 'Brisbane – Kultur, Fluss & Aussicht',
        location: 'Brisbane (QLD)',
        start: 'Hotel Rambla (Woolloongabba)',
        destination: 'South Bank & Mt Coot-tha',
        startCoords: [-27.4850, 153.0330],
        destCoords: [-27.4770, 152.9535],
        center: [-27.475, 152.990],
        zoom: 12,
        distance: 'ca. 18 km',
        driveTime: 'ca. 30 Min. CityCat / Fahrt',
        transportType: 'transit',
        accommodation: 'Rambla at Story House, Brisbane',
        stageRoute: [
          [-27.4850, 153.0330],
          [-27.4785, 153.0205],
          [-27.4700, 153.0000],
          [-27.4770, 152.9535]
        ],
        activities: ['South Bank Parklands & Streets Beach', 'CityCat Katamaranfahrt Brisbane River', 'Mt Coot-tha Panoramablick'],
        spotIds: [10, 11]
      },
      {
        day: 9,
        date: '29.03. (Mo)',
        title: 'Brisbane – Riverwalk & Urban Lifestyle',
        location: 'Brisbane & Sunshine Coast Hinterland (QLD)',
        start: 'Brisbane City',
        destination: 'Australia Zoo (Beerwah)',
        startCoords: [-27.4698, 153.0251],
        destCoords: [-26.8370, 152.9610],
        center: [-27.150, 153.000],
        zoom: 10,
        distance: 'ca. 150 km (Hin- & Rückweg)',
        driveTime: 'ca. 1 Std. je Richtung',
        transportType: 'drive',
        accommodation: 'Rambla at Story House, Brisbane',
        stageRoute: [
          [-27.4698, 153.0251],
          [-27.2000, 152.9800],
          [-26.8370, 152.9610]
        ],
        activities: ['Australia Zoo (Home of the Crocodile Hunter)', 'Kängurus füttern im Roo-Heaven', 'Crocoseum Wildlife Warriors'],
        spotIds: [12]
      },
      {
        day: 10,
        date: '30.03. (Di)',
        title: 'Brisbane → Glass House Mountains → Noosa',
        location: 'Brisbane → Glass House Mountains → Noosa (QLD)',
        start: 'Brisbane City',
        destination: 'Villa Noosa Hotel / Bounce Noosa',
        startCoords: [-27.4698, 153.0251],
        destCoords: [-26.3980, 153.0930],
        center: [-26.700, 153.050],
        zoom: 9,
        distance: 'ca. 150 km',
        driveTime: 'ca. 2,5 Std. Panoramaroute',
        transportType: 'drive',
        accommodation: 'Villa Noosa Hotel / Bounce Noosa (Noosaville, QLD)',
        stageRoute: [
          [-27.4698, 153.0251],
          [-26.9015, 152.9350],
          [-26.6500, 153.0667],
          [-26.3980, 153.0930],
          [-26.3810, 153.1110]
        ],
        activities: ['Wanderung auf den Mt Ngungun (Glass House Mountains)', 'Fairy Pools & Noosa Nationalpark Coastal Walk'],
        spotIds: [13, 14]
      },
      {
        day: 11,
        date: '31.03. (Mi)',
        title: 'Noosa → Carlo Sand Blow → Hervey Bay',
        location: 'Noosa → Rainbow Beach → Hervey Bay (QLD)',
        start: 'Noosa Heads',
        destination: 'Hervey Bay (Nightcap at Kondari Resort)',
        startCoords: [-26.3980, 153.0930],
        destCoords: [-25.2986, 152.8535],
        center: [-25.850, 153.000],
        zoom: 9,
        distance: 'ca. 190 km',
        driveTime: 'ca. 2,5 Std. Fahrtzeit',
        transportType: 'drive',
        accommodation: 'Nightcap at Kondari Resort, Hervey Bay (Hervey Bay, QLD)',
        stageRoute: [
          [-26.3980, 153.0930],
          [-25.9080, 153.0964],
          [-25.5500, 152.7000],
          [-25.2986, 152.8535]
        ],
        activities: ['Kängurus am Morgen in Noosa', 'Carlo Sand Blow Riesendüne Rainbow Beach', 'Fahrt nach Hervey Bay'],
        spotIds: [15]
      },
      {
        day: 12,
        date: '01.04. (Do)',
        title: 'K’gari (Fraser Island) & Nachtbus nach Norden',
        location: 'K’gari (Fraser Island) & Nachtbus (QLD)',
        start: 'Hervey Bay Fähranleger',
        destination: 'K’gari (Lake McKenzie & Maheno Wreck) → Nachtbus',
        startCoords: [-25.2986, 152.8535],
        destCoords: [-25.4490, 153.0580],
        center: [-25.350, 153.000],
        zoom: 9,
        distance: 'ca. 860 km Nachtbus-Transfer',
        driveTime: 'ca. 11 Std. Nachtbus (Hervey Bay → Airlie Beach)',
        transportType: 'transit',
        accommodation: 'Greyhound / Premier Nachtbus (Hervey Bay → Airlie Beach)',
        stageRoute: [
          [-25.2986, 152.8535],
          [-25.4490, 153.0580],
          [-24.8000, 152.3000],
          [-23.3500, 150.5000],
          [-21.1400, 149.1800],
          [-20.2675, 148.7180]
        ],
        activities: ['4x4 Offroad-Tour K’gari', 'Kristallklarer Lake McKenzie', 'Schiffswrack SS Maheno', 'Nachtbusfahrt gen Norden'],
        spotIds: [16]
      },
      {
        day: 13,
        date: '02.04. (Fr)',
        title: 'Ankunft Airlie Beach & Whitsundays Helikopter-Rundflug',
        location: 'Airlie Beach & Whitsundays (QLD)',
        start: 'Airlie Beach Busstation / Coral Sea Marina',
        destination: 'Coral Sea Vista Apartments',
        startCoords: [-20.2675, 148.7180],
        destCoords: [-20.2720, 148.7140],
        center: [-20.268, 148.718],
        zoom: 13,
        distance: 'ca. 15 km lokaler Radius',
        driveTime: 'ca. 20 Min. Shuttle',
        transportType: 'transit',
        accommodation: 'Coral Sea Vista Apartments, Airlie Beach (Airlie Beach, QLD)',
        stageRoute: [
          [-20.2675, 148.7180],
          [-20.2720, 148.7140]
        ],
        activities: ['Ankunft Nachtbus', 'Apartment Check-in & Strandlagune', 'Helikopter-Rundflug Great Barrier Reef & Heart Reef'],
        spotIds: [17]
      },
      {
        day: 14,
        date: '03.04. (Sa)',
        title: 'Whitsundays Highlight-Tag',
        location: 'Whitsunday Islands (QLD)',
        start: 'Coral Sea Marina (Airlie Beach)',
        destination: 'Hill Inlet Lookout & Whitehaven Beach',
        startCoords: [-20.2675, 148.7180],
        destCoords: [-20.2850, 149.0380],
        center: [-20.280, 148.880],
        zoom: 11,
        distance: 'ca. 70 km Katamaran-Seeweg',
        driveTime: 'Ganztagestour Boot',
        transportType: 'boat',
        accommodation: 'Coral Sea Vista Apartments, Airlie Beach',
        stageRoute: [
          [-20.2675, 148.7180],
          [-20.1500, 148.8500],
          [-20.2850, 149.0380]
        ],
        activities: ['Whitehaven Beach (98% reiner Quarzsand)', 'Hill Inlet Lookout Sandmuster', 'Schnorcheln am Korallenriff'],
        spotIds: [18]
      },
      {
        day: 15,
        date: '04.04. (So)',
        title: 'Airlie Beach & Umgebung (Cedar Creek Falls / Boardwalk)',
        location: 'Airlie Beach & Conway Nationalpark (QLD)',
        start: 'Airlie Beach',
        destination: 'Cedar Creek Falls (Conway Nationalpark)',
        startCoords: [-20.2675, 148.7180],
        destCoords: [-20.4070, 148.6940],
        center: [-20.340, 148.705],
        zoom: 11,
        distance: 'ca. 60 km (Hin- & Rückweg)',
        driveTime: 'ca. 35 Min. je Richtung',
        transportType: 'drive',
        accommodation: 'Coral Sea Vista Apartments, Airlie Beach',
        stageRoute: [
          [-20.2675, 148.7180],
          [-20.3400, 148.6800],
          [-20.4070, 148.6940]
        ],
        activities: ['Natur-Schwimmbecken Cedar Creek Falls', 'Regenwald-Idylle Conway Nationalpark', 'Bicentennial Walkway'],
        spotIds: [19]
      },
      {
        day: 16,
        date: '05.04. (Mo)',
        title: 'Airlie Beach - Flug nach Melbourne',
        location: 'Airlie Beach → Melbourne (QLD/VIC)',
        start: 'Whitsunday Coast Airport (PPP)',
        destination: 'Vibe Hotel Docklands (Melbourne)',
        startCoords: [-20.4950, 148.5520],
        destCoords: [-37.8160, 144.9380],
        center: [-37.818, 144.950],
        zoom: 13,
        distance: 'ca. 1.950 km Flug + 22 km Transfer',
        driveTime: 'ca. 3 Std. Flug + 30 Min. Transfer',
        transportType: 'flight',
        accommodation: 'Vibe Hotel Docklands, Melbourne (Docklands, VIC)',
        stageRoute: [
          [-20.4950, 148.5520],
          [-37.6690, 144.8410],
          [-37.8160, 144.9380],
          [-37.8205, 144.9640]
        ],
        activities: ['Flug PPP → MEL', 'SkyBus Transfer ins CBD', 'Southbank & Yarra River Abendspaziergang'],
        spotIds: [20]
      },
      {
        day: 17,
        date: '06.04. (Di)',
        title: 'Melbourne – Laneways, Street Art & Pinguine',
        location: 'Melbourne & St. Kilda (VIC)',
        start: 'Vibe Hotel Docklands',
        destination: 'Hosier Lane CBD & St. Kilda Pier',
        startCoords: [-37.8160, 144.9380],
        destCoords: [-37.8645, 144.9680],
        center: [-37.835, 144.960],
        zoom: 12,
        distance: 'ca. 10 km',
        driveTime: 'ca. 25 Min. Tram / ÖPNV',
        transportType: 'transit',
        accommodation: 'Vibe Hotel Docklands, Melbourne',
        stageRoute: [
          [-37.8160, 144.9380],
          [-37.8163, 144.9690],
          [-37.8350, 144.9750],
          [-37.8645, 144.9680]
        ],
        activities: ['Melbourne Laneways & Street Art Hosier Lane', 'Degraves Street Cafékultur', 'Zwergpinguine bei Sonnenuntergang St. Kilda Pier'],
        spotIds: [21, 22]
      },
      {
        day: 18,
        date: '07.04. (Mi)',
        title: 'Tagesausflug Great Ocean Road',
        location: 'Great Ocean Road (VIC)',
        start: 'Melbourne CBD',
        destination: 'Twelve Apostles & Loch Ard Gorge',
        startCoords: [-37.8136, 144.9631],
        destCoords: [-38.6655, 143.1040],
        center: [-38.500, 143.700],
        zoom: 9,
        distance: 'ca. 480 km (Hin- & Rückweg)',
        driveTime: 'ca. 6 - 7 Std. Fahrtzeit',
        transportType: 'drive',
        accommodation: 'Vibe Hotel Docklands, Melbourne',
        stageRoute: [
          [-37.8136, 144.9631],
          [-38.1499, 144.3617],
          [-38.3333, 144.3167],
          [-38.4333, 144.1833],
          [-38.5410, 143.9750],
          [-38.6730, 143.8640],
          [-38.7580, 143.6690],
          [-38.7490, 143.4120],
          [-38.6655, 143.1040]
        ],
        activities: ['Great Ocean Road Küstenstraße', 'Wilde Koalas in den Eukalyptusbäumen Kennett River', 'Twelve Apostles & Loch Ard Gorge'],
        spotIds: [23, 24]
      },
      {
        day: 19,
        date: '08.04. (Do)',
        title: 'Melbourne – Brighton Boxes & Fitzroy / Ausklang',
        location: 'Melbourne (VIC)',
        start: 'Vibe Hotel Docklands',
        destination: 'Brighton Beach & Fitzroy',
        startCoords: [-37.8160, 144.9380],
        destCoords: [-37.7985, 144.9785],
        center: [-37.840, 144.970],
        zoom: 12,
        distance: 'ca. 30 km',
        driveTime: 'ca. 35 Min. Bahn / Tram',
        transportType: 'transit',
        accommodation: 'Vibe Hotel Docklands, Melbourne',
        stageRoute: [
          [-37.8160, 144.9380],
          [-37.8500, 144.9600],
          [-37.9175, 144.9850],
          [-37.8100, 144.9700],
          [-37.7985, 144.9785]
        ],
        activities: ['Brighton Bathing Boxes (82 bunte Strandhäuser)', 'Vintage & Street Life in Fitzroy', 'Rooftop Bar Sunset Drink'],
        spotIds: [25, 26]
      },
      {
        day: 20,
        date: '09.04. (Fr)',
        title: 'Rückflug nach Wien',
        location: 'Melbourne → Wien (Rückflug)',
        start: 'Royal Botanic Gardens Victoria',
        destination: 'Melbourne Tullamarine Airport (MEL) → Wien (VIE)',
        startCoords: [-37.8304, 144.9800],
        destCoords: [-37.6690, 144.8410],
        center: [-37.750, 144.900],
        zoom: 11,
        distance: 'ca. 15.900 km Rückflug',
        driveTime: 'ca. 24 Std. Langstreckenflug',
        transportType: 'flight',
        accommodation: 'Langstreckenflug (Übernachtung an Bord / Flugzeug)',
        stageRoute: [
          [-37.8304, 144.9800],
          [-37.8136, 144.9631],
          [-37.6690, 144.8410]
        ],
        activities: ['Spaziergang Royal Botanic Gardens Victoria', 'SkyBus Transfer zum Airport MEL', 'Rückflug nach Wien'],
        spotIds: [27]
      }
    ];

    // =========================================================================
    // INTELLIGENTER LIVE-REISESTATUS (HERO) & TAGESPLAN-STEUERUNG
    // =========================================================================
    const TRIP_DAYS = [
      { day: 0, date: '2027-03-20', title: 'Fahrt nach Wien & Vorübernachtung' },
      { day: 1, date: '2027-03-21', title: 'Abreise aus Wien nach Sydney' },
      { day: 2, date: '2027-03-22', title: 'Ankunft in Sydney & Darling Harbour' },
      { day: 3, date: '2027-03-23', title: 'Sydney – Klassiker am Hafen & Manly Ferry' },
      { day: 4, date: '2027-03-24', title: 'Sydney – Coastal Walk & Trendviertel' },
      { day: 5, date: '2027-03-25', title: 'Flug nach Ballina / Byron Bay' },
      { day: 6, date: '2027-03-26', title: 'Byron Bay – Surfen & Kajak' },
      { day: 7, date: '2027-03-27', title: 'Byron Bay ➔ Gold Coast ➔ Brisbane' },
      { day: 8, date: '2027-03-28', title: 'Brisbane City & South Bank' },
      { day: 9, date: '2027-03-29', title: 'Australia Zoo (Beerwah)' },
      { day: 10, date: '2027-03-30', title: 'Fahrt nach Noosa & Glass House Mountains' },
      { day: 11, date: '2027-03-31', title: 'Rainbow Beach & Carlo Sand Blow ➔ Hervey Bay' },
      { day: 12, date: '2027-04-01', title: 'K’gari (Fraser Island) & Greyhound Nachtbus' },
      { day: 13, date: '2027-04-02', title: 'Airlie Beach & Whitsundays Helikopter' },
      { day: 14, date: '2027-04-03', title: 'Whitsundays Segeln & Whitehaven Beach' },
      { day: 15, date: '2027-04-04', title: 'Airlie Beach Erholung & Cedar Creek Falls' },
      { day: 16, date: '2027-04-05', title: 'Flug nach Melbourne' },
      { day: 17, date: '2027-04-06', title: 'Melbourne City, Laneways & St. Kilda Pinguine' },
      { day: 18, date: '2027-04-07', title: 'Great Ocean Road Tagestour (Twelve Apostles)' },
      { day: 19, date: '2027-04-08', title: 'Melbourne Brighton Beach & Fitzroy Rooftop' },
      { day: 20, date: '2027-04-09', title: 'Melbourne Ausklang & Heimflug nach Wien' }
    ];

    function jumpToDay(dayNum) {
      const dayEl = document.getElementById('day-' + dayNum);
      if (!dayEl) return;
      dayEl.open = true;
      const dayPlan = dayEl.querySelector('.day-plan-accordion');
      if (dayPlan) dayPlan.open = true;
      dayEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }


    // =========================================================================
    // ZENTRALES REISE-DASHBOARD (AUTOMATISCH / PRE / DURING / POST)
    // =========================================================================
    let dashboardSimMode = 'auto'; // 'auto' | 'pre' | 'during' | 'post'
    let dashboardSimDay = 1; // 1..20

    const DAY_PLANNED_EXPENSES = {
      1: { amount: 453, label: 'Langstreckenflug Wien → Sydney (gebucht)' },
      2: { amount: 150, label: 'The Ultimo Sydney Hotel & Transfer' },
      3: { amount: 35, label: 'Manly Ferry & The Rocks Harbour Bridge Walk' },
      4: { amount: 40, label: 'Bondi Coastal Walk Verpflegung & Cafés' },
      5: { amount: 205, label: 'Inlandsflug SYD → Ballina (125 €) + Mietwagen (80 €)' },
      6: { amount: 65, label: 'AirBnB East Ballina & Kajaktour' },
      7: { amount: 120, label: 'Hotel Brisbane (95 €) + Sprit Anteil (25 €)' },
      8: { amount: 25, label: 'Brisbane CityCat Katamaran & South Bank' },
      9: { amount: 60, label: 'Australia Zoo Beerwah Ticket' },
      10: { amount: 90, label: 'Villa Noosa Hotel & Nationalpark' },
      11: { amount: 95, label: 'Hervey Bay Kondari Resort & Rainbow Beach' },
      12: { amount: 235, label: 'K’gari 4x4 Offroad-Tour (180 €) + Nachtbus (55 €)' },
      13: { amount: 330, label: 'Coral Sea Vista Whitsundays (110 €) + Heli-Rundflug (220 €)' },
      14: { amount: 145, label: 'Whitsundays Segeltour & Whitehaven Beach' },
      15: { amount: 50, label: 'Cedar Creek Falls & Entspannung Whitsundays' },
      16: { amount: 235, label: 'Inlandsflug PPP → MEL (140 €) + Vibe Hotel (95 €)' },
      17: { amount: 125, label: 'Vibe Hotel Melbourne (95 €) + Cafés & Pinguine (30 €)' },
      18: { amount: 70, label: 'Great Ocean Road Tagestour & Mietwagen Sprit' },
      19: { amount: 65, label: 'Melbourne Brighton Beach & Fitzroy Rooftop' },
      20: { amount: 45, label: 'Royal Botanic Gardens & Airport Transfer' }
    };

    function setDashboardSimMode(mode) {
      dashboardSimMode = mode;
      document.querySelectorAll('.dashboard-sim-controls .sim-btn').forEach(btn => btn.classList.remove('active'));
      const activeBtn = document.getElementById('sim-btn-' + mode);
      if (activeBtn) activeBtn.classList.add('active');

      const daySel = document.getElementById('sim-day-selector');
      if (daySel) {
        if (mode === 'during') {
          daySel.style.display = 'inline-block';
          daySel.value = dashboardSimDay;
        } else {
          daySel.style.display = 'none';
        }
      }

      const container = document.getElementById('trip-dashboard-content');
      if (container) container.dataset.renderedPhase = '';
      updateLiveTripStatus();
    }

    function setDashboardSimDay(dayNum) {
      dashboardSimDay = parseInt(dayNum, 10) || 1;
      const container = document.getElementById('trip-dashboard-content');
      if (container) container.dataset.renderedPhase = '';
      setDashboardSimMode('during');
    }

    function determineCurrentTripState() {
      if (dashboardSimMode === 'pre') return { phase: 'pre', dayNum: 0 };
      if (dashboardSimMode === 'post') return { phase: 'post', dayNum: 20 };
      if (dashboardSimMode === 'during') return { phase: 'during', dayNum: dashboardSimDay };

      // AUTOMATISCHE ERMITTLUNG NACH ECHTEM DATUM
      const now = new Date();
      // Start: 20. März 2027 (Tag 0: Fahrt nach Wien & Vorübernachtung)
      const tripStart = new Date("2027-03-20T00:00:00+01:00");
      // Ende: 09. April 2027 23:59:59 australische Zeit (10.04.2027 00:00 AEST)
      const tripEnd = new Date("2027-04-10T00:00:00+10:00");

      if (now < tripStart) {
        return { phase: 'pre', dayNum: 0, diffMs: tripStart.getTime() - now.getTime() };
      } else if (now >= tripEnd) {
        return { phase: 'post', dayNum: 20 };
      } else {
        // Während der Reise
        const tz = (currentSelectedTz && currentSelectedTz.trim()) ? currentSelectedTz.trim() : 'Australia/Sydney';
        let dateStr;
        try {
          dateStr = new Intl.DateTimeFormat('en-CA', {
            timeZone: tz,
            year: 'numeric', month: '2-digit', day: '2-digit'
          }).format(now);
        } catch (e) {
          dateStr = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Australia/Sydney',
            year: 'numeric', month: '2-digit', day: '2-digit'
          }).format(now);
        }

        let found = TRIP_DAYS.find(d => d.date === dateStr);
        let dayNum = found ? found.day : 0;
        return { phase: 'during', dayNum };
      }
    }

    function getWeatherCityForDay(dayNum) {
      if (dayNum <= 4) return 'sydney';
      if (dayNum <= 15) return 'brisbane';
      return 'melbourne';
    }

    function getCityDisplayForDay(dayNum) {
      if (dayNum <= 4) return 'Sydney (NSW)';
      if (dayNum <= 6) return 'Byron Bay / Ballina (NSW)';
      if (dayNum <= 9) return 'Brisbane & Hinterland (QLD)';
      if (dayNum <= 11) return 'Noosa & Hervey Bay (QLD)';
      if (dayNum <= 12) return 'K’gari Fraser Island (QLD)';
      if (dayNum <= 15) return 'Airlie Beach & Whitsundays (QLD)';
      return 'Melbourne & Victoria (VIC)';
    }

    function jumpToCurrentOrNextDay() {
      const state = (typeof determineCurrentTripState === 'function') ? determineCurrentTripState() : { phase: 'pre', dayNum: 0 };
      const targetDay = (state.phase === 'during' && state.dayNum !== undefined) ? state.dayNum : 0;
      showView('reise');
      setTimeout(() => jumpToDay(targetDay), 120);
    }
    window.jumpToCurrentOrNextDay = jumpToCurrentOrNextDay;

    function updateTripDashboard() {
      const state = determineCurrentTripState();
      const allDays = (window.tripData && window.tripData.length) ? window.tripData : TRIP_DAYS_DATA;

      // 1. Calculate Countdown
      const now = new Date();
      const tripStart = new Date("2027-03-21T10:00:00+01:00");
      let diff = tripStart.getTime() - now.getTime();
      if (diff < 0) diff = 0;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
      const seconds = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');

      // Update cockpit countdown
      const elDays = document.getElementById('cd-days');
      const elHours = document.getElementById('cd-hours');
      const elMins = document.getElementById('cd-minutes');
      const elSecs = document.getElementById('cd-seconds');
      if (elDays && elHours && elMins && elSecs) {
        elDays.textContent = days;
        elHours.textContent = hours;
        elMins.textContent = minutes;
        elSecs.textContent = seconds;
      }

      // 2. Determine current or next day
      const currentDayNum = (state.phase === 'during' && state.dayNum !== undefined) ? state.dayNum : 0;
      const d = allDays.find(x => x.day === currentDayNum || x.dayNumber === currentDayNum) ||
                TRIP_DAYS.find(x => x.day === currentDayNum) ||
                allDays[0];
      const dDay = (d && d.day !== undefined) ? d.day : ((d && d.dayNumber !== undefined) ? d.dayNumber : currentDayNum);

      // 3. Update "ALS NÄCHSTES" section
      const titleEl = document.getElementById('cockpit-next-title');
      const destEl = document.getElementById('cockpit-next-destination');
      const actsEl = document.getElementById('cockpit-next-activities');
      const dayNumEl = document.getElementById('cockpit-next-daynum');
      const btnEl = document.getElementById('cockpit-btn-open-day');

      if (titleEl && d) {
        titleEl.textContent = `Tag ${dDay}: ${d.title}`;
      }
      if (destEl && d) {
        destEl.innerHTML = `<i class="fa-solid fa-map-pin"></i> <span>Ziel: ${escapeHtml(d.destination || d.start || 'Australien')}</span>`;
      }
      if (actsEl && d) {
        let actSummary = '';
        if (d.activities && Array.isArray(d.activities) && d.activities.length > 0) {
          actSummary = d.activities.slice(0, 3).map(a => typeof a === 'string' ? a : (a.title || a.name || '')).filter(Boolean).join(' · ');
        }
        if (!actSummary && d.highlights && Array.isArray(d.highlights) && d.highlights.length > 0) {
          actSummary = d.highlights.slice(0, 3).join(' · ');
        }
        if (!actSummary) {
          actSummary = `${d.start} ➔ ${d.destination}`;
        }
        actsEl.innerHTML = `<i class="fa-solid fa-compass"></i> <span>${escapeHtml(actSummary)}</span>`;
      }
      if (dayNumEl && d) {
        dayNumEl.textContent = state.phase === 'post' ? 'Reise beendet' : `Tag ${dDay} von 20`;
      }
      if (btnEl && d) {
        btnEl.onclick = () => {
          showView('reise');
          setTimeout(() => jumpToDay(dDay), 120);
        };
      }

      // 4. Update legacy / simulation container if present in Tools
      const container = document.getElementById('trip-dashboard-content');
      if (container) {
        if (state.phase === 'pre') {
          renderDashboardPreTrip(container, state);
        } else if (state.phase === 'during') {
          renderDashboardDuringTrip(container, state.dayNum);
        } else {
          renderDashboardPostTrip(container);
        }
      }
    }

    // 1. VOR DER REISE
    function renderDashboardPreTrip(container, state) {
      const now = new Date();
      const tripStart = new Date("2027-03-21T10:00:00+01:00");
      let diff = tripStart.getTime() - now.getTime();
      if (diff < 0) diff = 0;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
      const seconds = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');

      if (container.dataset.renderedPhase === 'pre') {
        const elDays = document.getElementById('cd-days');
        const elHours = document.getElementById('cd-hours');
        const elMins = document.getElementById('cd-minutes');
        const elSecs = document.getElementById('cd-seconds');
        const elHead = document.getElementById('cd-headline-days');
        if (elDays && elHours && elMins && elSecs) {
          elDays.innerText = days;
          elHours.innerText = hours;
          elMins.innerText = minutes;
          elSecs.innerText = seconds;
          if (elHead) elHead.innerText = days + ' Tagen';
          return;
        }
      }
      container.dataset.renderedPhase = 'pre';

      const day1 = TRIP_DAYS_DATA[0];
      const day2 = TRIP_DAYS_DATA[1];

      container.innerHTML = `
        <div class="dashboard-phase-banner pre-trip">
          <div class="banner-status-badge"><i class="fa-solid fa-hourglass-half"></i> Reise steht bevor · Countdown läuft</div>
          <div class="banner-headline">Abflug in <strong id="cd-headline-days">${days} Tagen</strong> nach Australien 🦘🇦🇺</div>
          <div class="banner-subline">
            Abreisedatum: <strong>Sonntag, 21. März 2027 · 10:00 Uhr (MEZ)</strong> ab Flughafen Wien-Schwechat (VIE) mit Scoot TR 12 nach Singapur &amp; Sydney.
          </div>

          <div class="countdown-grid">
            <div class="countdown-unit">
              <div class="countdown-num" id="dash-banner-cd-days">${days}</div>
              <div class="countdown-lbl">Tage</div>
            </div>
            <div class="countdown-unit">
              <div class="countdown-num" id="dash-banner-cd-hours">${hours}</div>
              <div class="countdown-lbl">Stunden</div>
            </div>
            <div class="countdown-unit">
              <div class="countdown-num" id="dash-banner-cd-minutes">${minutes}</div>
              <div class="countdown-lbl">Minuten</div>
            </div>
            <div class="countdown-unit">
              <div class="countdown-num" id="dash-banner-cd-seconds">${seconds}</div>
              <div class="countdown-lbl">Sekunden</div>
            </div>
          </div>
        </div>

        <div class="dashboard-cards-grid">
          <!-- Card 1: Nächster Reisetag -->
          <div class="dash-card">
            <div>
              <div class="dash-card-header">
                <div class="dash-card-icon"><i class="fa-solid fa-calendar-day"></i></div>
                <div class="dash-card-title">Nächster Reisetag</div>
              </div>
              <div class="dash-card-body">
                <div class="dash-card-primary-val">Tag 1: ${escapeHtml(day1.title)}</div>
                <div class="dash-card-desc">
                  <i class="fa-regular fa-clock" style=""></i> <strong>Datum:</strong> 21.03.2027 (Sonntag)<br>
                  <i class="fa-solid fa-plane-departure" style=""></i> <strong>Start:</strong> ${escapeHtml(day1.start)}<br>
                  <i class="fa-solid fa-location-dot" style=""></i> <strong>Ziel:</strong> ${escapeHtml(day1.destination)}
                </div>
                <div class="dash-card-meta-row">
                  <span class="dash-meta-badge"><i class="fa-solid fa-plane"></i> Langstreckenflug</span>
                  <span class="dash-meta-badge"><i class="fa-solid fa-ticket"></i> Flug TR 12 gebucht</span>
                </div>
              </div>
            </div>
            <div class="dash-card-actions">
              <button type="button" class="btn-dash-action primary" onclick="jumpToDayAndHighlight(1)">
                <i class="fa-solid fa-arrow-down"></i> Tag 1 im Reiseplan öffnen
              </button>
              <button type="button" class="btn-dash-action secondary" onclick="focusDayOnMap(1)">
                <i class="fa-solid fa-map-location-dot"></i> Auf Karte ansehen
              </button>
            </div>
          </div>

          <!-- Card 2: Nächstes Ziel in Australien -->
          <div class="dash-card">
            <div>
              <div class="dash-card-header">
                <div class="dash-card-icon" style="background:rgba(217, 107, 39, 0.12)"><i class="fa-solid fa-flag-checkered"></i></div>
                <div class="dash-card-title">Nächstes Ziel</div>
              </div>
              <div class="dash-card-body">
                <div class="dash-card-primary-val">Sydney, New South Wales (NSW)</div>
                <div class="dash-card-desc">
                  Ankunft nach 22h Flug am 22. März um 18:50 Uhr.<br>
                  <strong>Erste Unterkunft:</strong> ${escapeHtml(day2.accommodation)}
                </div>
                <div class="dash-card-meta-row">
                  <span class="dash-meta-badge highlight"><i class="fa-solid fa-hotel"></i> Check-in gebucht</span>
                  <span class="dash-meta-badge"><i class="fa-solid fa-utensils"></i> Darling Harbour</span>
                </div>
              </div>
            </div>
            <div class="dash-card-actions">
              <button type="button" class="btn-dash-action primary" onclick="focusDayOnMap(2)">
                <i class="fa-solid fa-map"></i> Sydney auf Karte fokussieren
              </button>
              <button type="button" class="btn-dash-action secondary" onclick="jumpToDayAndHighlight(2)">
                <i class="fa-solid fa-calendar"></i> Tag 2 Tagesplan
              </button>
            </div>
          </div>

          <!-- Card 3: Roadtrip Gesamt-Eckdaten -->
          <div class="dash-card">
            <div>
              <div class="dash-card-header">
                <div class="dash-card-icon" style="background:rgba(2, 132, 199, 0.12)"><i class="fa-solid fa-route"></i></div>
                <div class="dash-card-title">Reise-Eckdaten</div>
              </div>
              <div class="dash-card-body">
                <div class="dash-card-primary-val">20 Tage · 4 Personen</div>
                <ul class="dash-card-list">
                  <li onclick="focusDayOnMap(null)" style="cursor:pointer" title="Klicken: Gesamte Route auf Karte ansehen"><i class="fa-solid fa-road"></i> <span><strong>ca. 2.100 km</strong> Mietwagenstrecke</span></li>
                  <li onclick="jumpToDayAndHighlight(4)" style="cursor:pointer" title="Klicken: Flüge im Reiseplan anzeigen"><i class="fa-solid fa-plane"></i> <span><strong>2 Inlandsflüge</strong> (SYD➔BNK &amp; PPP➔MEL)</span></li>
                  <li onclick="focusDayOnMap(null)" style="cursor:pointer" title="Klicken: Alle 27 Sightseeing-Spots auf Karte ansehen"><i class="fa-solid fa-camera"></i> <span><strong>27 Sightseeing-Spots</strong> &amp; Fototipps</span></li>
                  <li onclick="openBudgetDetails('budget-charts-main-card')" style="cursor:pointer" title="Klicken: Zum Budget-Bereich springen"><i class="fa-solid fa-wallet"></i> <span><strong>Budget:</strong> ca. 2.772 € p.P. (inkl. Taschengeld)</span></li>
                </ul>
              </div>
            </div>
            <div class="dash-card-actions">
              <button type="button" class="btn-dash-action secondary" onclick="focusDayOnMap(null)">
                <i class="fa-solid fa-arrows-spin"></i> Gesamtroute ansehen
              </button>
              <button type="button" class="btn-dash-action secondary" onclick="openBudgetDetails('budget-charts-main-card')">
                <i class="fa-solid fa-chart-pie"></i> Budget prüfen
              </button>
            </div>
          </div>

          <!-- Card 4: Live-Wetter Sydney Vorschau -->
          <div class="dash-card">
            <div>
              <div class="dash-card-header">
                <div class="dash-card-icon" style="background:rgba(2,132,199,0.12)"><i class="fa-solid fa-cloud-sun"></i></div>
                <div class="dash-card-title">Wetter am Ankunftsort</div>
              </div>
              <div class="dash-card-body">
                <div class="dash-card-primary-val">Sydney (NSW)</div>
                <div class="dash-weather-box">
                  <div class="dash-weather-icon"><i class="fa-solid fa-sun" style=""></i></div>
                  <div>
                    <div class="dash-weather-temp" id="dash-pre-temp">${document.getElementById('weather-temp-sydney') ? document.getElementById('weather-temp-sydney').innerText : '24°C'}</div>
                    <div class="dash-weather-meta">${document.getElementById('weather-cond-sydney') ? document.getElementById('weather-cond-sydney').innerText : 'Sonnig &amp; Mild'} · Ankunft Tag 2</div>
                  </div>
                </div>
                <div class="dash-card-desc" style="margin-top:0.6rem; font-size:0.82rem">
                  <i class="fa-solid fa-circle-info" style=""></i> Angenehme Herbsttemperaturen in New South Wales.
                </div>
              </div>
            </div>
            <div class="dash-card-actions">
              <button type="button" class="btn-dash-action secondary" onclick="fetchLiveWeather(true)">
                <i class="fa-solid fa-rotate"></i> Wetter aktualisieren
              </button>
              <a href="#weather" class="btn-dash-action secondary">
                <i class="fa-solid fa-umbrella"></i> 3-Städte Wetter
              </a>
            </div>
          </div>

          <!-- Card 5: Reisevorbereitung & Reisedokumente -->
          <div class="dash-card">
            <div>
              <div class="dash-card-header">
                <div class="dash-card-icon" style="background:rgba(16,185,129,0.12)"><i class="fa-solid fa-passport"></i></div>
                <div class="dash-card-title">Reisevorbereitung</div>
              </div>
              <div class="dash-card-body">
                <div class="dash-card-primary-val">Dokumente &amp; Checkliste</div>
                <ul class="dash-card-list">
                  <li><i class="fa-solid fa-check"></i> <span><strong>eVisitor 651:</strong> Gültiges Visum für 4 Personen</span></li>
                  <li><i class="fa-solid fa-check"></i> <span><strong>Flugtickets:</strong> Scoot TR 12 (Wien ➔ Singapur ➔ SYD)</span></li>
                  <li><i class="fa-solid fa-check"></i> <span><strong>Unterkünfte:</strong> Alle 7 Stationen vorab reserviert</span></li>
                  <li><i class="fa-solid fa-check"></i> <span><strong>Führerschein:</strong> Nationaler + Internationaler Schein</span></li>
                </ul>
              </div>
            </div>
            <div class="dash-card-actions">
              <button type="button" class="btn-dash-action primary" onclick="openPackingList()">
                <i class="fa-solid fa-suitcase-rolling"></i> Interaktive Packliste
              </button>
              <button type="button" class="btn-dash-action secondary" onclick="switchOrgTab('bookings'); document.getElementById('organization').scrollIntoView({behavior:'smooth'});">
                <i class="fa-solid fa-receipt"></i> Alle Buchungen
              </button>
              <a href="#emergency" class="btn-dash-action secondary">
                <i class="fa-solid fa-shield-halved"></i> Notfall-Tresor
              </a>
            </div>
          </div>
        </div>
      `;
    }

    // =========================================================================
    // TRIP COCKPIT: UNTERKUNFT & CHECK-IN DATEN (TAGE 1–20)
    // =========================================================================
    const ACCOMMODATION_DETAILS = {
      1: {
        name: 'Langstreckenflug Scoot TR 12',
        address: 'Flughafen Wien (VIE) → Singapur (SIN) → Sydney (SYD)',
        location: 'Flugzeug / Transit',
        checkIn: 'Boarding 09:15 Uhr',
        checkOut: 'Landung 18:50 Uhr (Tag 2)',
        bookingUrl: '',
        bookingLabel: 'Flug TR 12 gebucht',
        type: 'flight'
      },
      2: {
        name: 'The Ultimo, Sydney',
        address: '50 Jones St, Ultimo NSW 2007 (Chinatown / Haymarket)',
        location: 'Sydney (NSW)',
        checkIn: 'ab 14:00 Uhr',
        checkOut: 'bis 11:00 Uhr (am 25.03.)',
        bookingUrl: 'https://www.theultimo.com.au',
        bookingLabel: 'Hotel Website (The Ultimo)',
        type: 'hotel'
      },
      3: {
        name: 'The Ultimo, Sydney',
        address: '50 Jones St, Ultimo NSW 2007 (Chinatown / Haymarket)',
        location: 'Sydney (NSW)',
        checkIn: 'Bereits eingecheckt',
        checkOut: 'bis 11:00 Uhr (am 25.03.)',
        bookingUrl: 'https://www.theultimo.com.au',
        bookingLabel: 'Hotel Website (The Ultimo)',
        type: 'hotel'
      },
      4: {
        name: 'The Ultimo, Sydney',
        address: '50 Jones St, Ultimo NSW 2007 (Chinatown / Haymarket)',
        location: 'Sydney (NSW)',
        checkIn: 'Bereits eingecheckt',
        checkOut: 'Morgen bis 11:00 Uhr',
        bookingUrl: 'https://www.theultimo.com.au',
        bookingLabel: 'Hotel Website (The Ultimo)',
        type: 'hotel'
      },
      5: {
        name: 'AirBnB East Ballina',
        address: 'East Ballina, NSW 2478',
        location: 'East Ballina / Byron Bay (NSW)',
        checkIn: 'ab 15:00 Uhr',
        checkOut: 'bis 10:00 Uhr (am 27.03.)',
        bookingUrl: 'https://www.airbnb.at/rooms/1065553106126009714',
        bookingLabel: 'AirBnB Buchung öffnen',
        type: 'airbnb'
      },
      6: {
        name: 'AirBnB East Ballina',
        address: 'East Ballina, NSW 2478',
        location: 'East Ballina / Byron Bay (NSW)',
        checkIn: 'Bereits eingecheckt',
        checkOut: 'Morgen bis 10:00 Uhr',
        bookingUrl: 'https://www.airbnb.at/rooms/1065553106126009714',
        bookingLabel: 'AirBnB Buchung öffnen',
        type: 'airbnb'
      },
      7: {
        name: 'Rambla at Story House',
        address: 'Woolloongabba / Kangaroo Point, Brisbane QLD',
        location: 'Brisbane City (QLD)',
        checkIn: 'ab 14:00 Uhr',
        checkOut: 'bis 10:00 Uhr (am 30.03.)',
        bookingUrl: 'https://www.rambla.com.au/locations/story-house',
        bookingLabel: 'Rambla Hotel Website',
        type: 'hotel'
      },
      8: {
        name: 'Rambla at Story House',
        address: 'Woolloongabba / Kangaroo Point, Brisbane QLD',
        location: 'Brisbane City (QLD)',
        checkIn: 'Bereits eingecheckt',
        checkOut: 'bis 10:00 Uhr (am 30.03.)',
        bookingUrl: 'https://www.rambla.com.au/locations/story-house',
        bookingLabel: 'Rambla Hotel Website',
        type: 'hotel'
      },
      9: {
        name: 'Rambla at Story House',
        address: 'Woolloongabba / Kangaroo Point, Brisbane QLD',
        location: 'Brisbane City (QLD)',
        checkIn: 'Bereits eingecheckt',
        checkOut: 'Morgen bis 10:00 Uhr',
        bookingUrl: 'https://www.rambla.com.au/locations/story-house',
        bookingLabel: 'Rambla Hotel Website',
        type: 'hotel'
      },
      10: {
        name: 'Villa Noosa Hotel',
        address: '19 Mary St, Noosaville QLD 4566',
        location: 'Noosa Heads / Noosaville (QLD)',
        checkIn: 'ab 14:00 Uhr',
        checkOut: 'Morgen bis 10:00 Uhr',
        bookingUrl: 'https://www.villanoosa.com.au',
        bookingLabel: 'Villa Noosa Website',
        type: 'hotel'
      },
      11: {
        name: 'Nightcap at Kondari Resort',
        address: '49-63 Elizabeth St, Urangan QLD 4655',
        location: 'Hervey Bay (QLD)',
        checkIn: 'ab 14:00 Uhr',
        checkOut: 'Morgen bis 10:00 Uhr',
        bookingUrl: 'https://nightcap.nighteliercollective.com.au',
        bookingLabel: 'Kondari Resort Website',
        type: 'hotel'
      },
      12: {
        name: 'Greyhound Australia Nachtbus',
        address: 'Fraser Coast (Hervey Bay) ➔ Airlie Beach',
        location: 'K’gari Fraser Island / Nachtbus',
        checkIn: 'Abfahrt 20:30 Uhr',
        checkOut: 'Ankunft ca. 08:30 Uhr (Tag 13)',
        bookingUrl: 'https://www.greyhound.com.au',
        bookingLabel: 'Greyhound Bus Ticket',
        type: 'bus'
      },
      13: {
        name: 'Coral Sea Vista Apartments',
        address: '20 The Esplanade, Airlie Beach QLD 4802',
        location: 'Airlie Beach (QLD)',
        checkIn: 'ab 14:00 Uhr (Gepäckabgabe morgens)',
        checkOut: 'bis 10:00 Uhr (am 05.04.)',
        bookingUrl: 'https://www.booking.com/hotel/au/coral-sea-vista-apartments.de.html',
        bookingLabel: 'Booking.com Buchung',
        type: 'hotel'
      },
      14: {
        name: 'Coral Sea Vista Apartments',
        address: '20 The Esplanade, Airlie Beach QLD 4802',
        location: 'Airlie Beach (QLD)',
        checkIn: 'Bereits eingecheckt',
        checkOut: 'bis 10:00 Uhr (am 05.04.)',
        bookingUrl: 'https://www.booking.com/hotel/au/coral-sea-vista-apartments.de.html',
        bookingLabel: 'Booking.com Buchung',
        type: 'hotel'
      },
      15: {
        name: 'Coral Sea Vista Apartments',
        address: '20 The Esplanade, Airlie Beach QLD 4802',
        location: 'Airlie Beach (QLD)',
        checkIn: 'Bereits eingecheckt',
        checkOut: 'Morgen bis 10:00 Uhr',
        bookingUrl: 'https://www.booking.com/hotel/au/coral-sea-vista-apartments.de.html',
        bookingLabel: 'Booking.com Buchung',
        type: 'hotel'
      },
      16: {
        name: 'Vibe Hotel Melbourne Docklands',
        address: '44 Aquitania Way, Docklands VIC 3008',
        location: 'Melbourne Docklands (VIC)',
        checkIn: 'ab 14:00 Uhr',
        checkOut: 'bis 11:00 Uhr (am 09.04.)',
        bookingUrl: 'https://vibehotels.com',
        bookingLabel: 'Vibe Hotel Website',
        type: 'hotel'
      },
      17: {
        name: 'Vibe Hotel Melbourne Docklands',
        address: '44 Aquitania Way, Docklands VIC 3008',
        location: 'Melbourne Docklands (VIC)',
        checkIn: 'Bereits eingecheckt',
        checkOut: 'bis 11:00 Uhr (am 09.04.)',
        bookingUrl: 'https://vibehotels.com',
        bookingLabel: 'Vibe Hotel Website',
        type: 'hotel'
      },
      18: {
        name: 'Vibe Hotel Melbourne Docklands',
        address: '44 Aquitania Way, Docklands VIC 3008',
        location: 'Melbourne Docklands (VIC)',
        checkIn: 'Bereits eingecheckt',
        checkOut: 'bis 11:00 Uhr (am 09.04.)',
        bookingUrl: 'https://vibehotels.com',
        bookingLabel: 'Vibe Hotel Website',
        type: 'hotel'
      },
      19: {
        name: 'Vibe Hotel Melbourne Docklands',
        address: '44 Aquitania Way, Docklands VIC 3008',
        location: 'Melbourne Docklands (VIC)',
        checkIn: 'Bereits eingecheckt',
        checkOut: 'Morgen bis 11:00 Uhr',
        bookingUrl: 'https://vibehotels.com',
        bookingLabel: 'Vibe Hotel Website',
        type: 'hotel'
      },
      20: {
        name: 'Rückflug nach Wien (Scoot TR 25)',
        address: 'Melbourne Tullamarine Airport (MEL)',
        location: 'Flughafen / Rückflug',
        checkIn: 'Check-in ab 18:00 Uhr',
        checkOut: 'Landung in Wien (Tag 21)',
        bookingUrl: '',
        bookingLabel: 'Flug TR 25 gebucht',
        type: 'flight'
      }
    };

    function getAccommodationDetails(dayNum) {
      return ACCOMMODATION_DETAILS[dayNum] || {
        name: 'Unterkunft Tag ' + dayNum,
        address: 'Australien',
        location: 'Australien',
        checkIn: 'ab 14:00 Uhr',
        checkOut: 'bis 10:00 Uhr',
        bookingUrl: '',
        bookingLabel: 'Buchung hinterlegt',
        type: 'hotel'
      };
    }

    const TRIP_DATES_LONG = [
      'Sonntag, 21. März 2027',
      'Montag, 22. März 2027',
      'Dienstag, 23. März 2027',
      'Mittwoch, 24. März 2027',
      'Donnerstag, 25. März 2027',
      'Freitag, 26. März 2027',
      'Samstag, 27. März 2027',
      'Sonntag, 28. März 2027',
      'Montag, 29. März 2027',
      'Dienstag, 30. März 2027',
      'Mittwoch, 31. März 2027',
      'Donnerstag, 01. April 2027',
      'Freitag, 02. April 2027',
      'Samstag, 03. April 2027',
      'Sonntag, 04. April 2027',
      'Montag, 05. April 2027',
      'Dienstag, 06. April 2027',
      'Mittwoch, 07. April 2027',
      'Donnerstag, 08. April 2027',
      'Freitag, 09. April 2027'
    ];

    function getNextRelevantPlace(dayData, dayNum) {
      if (dayData.spotIds && dayData.spotIds.length > 0) {
        const spots = ALL_SIGHTSEEING_SPOTS.filter(s => dayData.spotIds.includes(s.id));
        if (spots.length > 1) {
          return spots[1].name;
        } else if (spots.length === 1) {
          return spots[0].name;
        }
      }
      const nextDay = TRIP_DAYS_DATA.find(d => d.day === dayNum + 1);
      if (nextDay) {
        return 'Morgen: ' + nextDay.title;
      }
      return 'Rückflug nach Wien (Schwechat)';
    }

    function openCheckinSlide(hotelName) {
      const slide = document.getElementById('checkin-infocards-slide');
      if (slide) {
        slide.open = true;
        slide.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (hotelName) {
          const searchKey = hotelName.toLowerCase().slice(0, 10);
          slide.querySelectorAll('details.checkin-card').forEach(card => {
            if (card.innerText.toLowerCase().includes(searchKey)) {
              card.open = true;
            }
          });
        }
      } else {
        const hub = document.getElementById('hub');
        if (hub) hub.scrollIntoView({ behavior: 'smooth' });
      }
    }

    // 2. WÄHREND DER REISE
    function renderDashboardDuringTrip(container, dayNum) {
      const phaseKey = 'during_' + dayNum;
      if (container.dataset.renderedPhase === phaseKey) {
        return;
      }
      container.dataset.renderedPhase = phaseKey;

      const dayData = TRIP_DAYS_DATA.find(d => d.day === dayNum) || TRIP_DAYS_DATA[0];
      const nextDayData = TRIP_DAYS_DATA.find(d => d.day === dayNum + 1);
      const fullDateStr = TRIP_DATES_LONG[dayNum - 1] || dayData.date;
      const progressPercent = Math.round((dayNum / 20) * 100);

      // Zeit & Zeitzone
      const tz = (currentSelectedTz && currentSelectedTz.trim()) ? currentSelectedTz.trim() : 'Australia/Sydney';
      let aussieClock = '';
      try {
        aussieClock = new Date().toLocaleTimeString('de-DE', { timeZone: tz, hour: '2-digit', minute: '2-digit' }) + ' Uhr';
      } catch (e) {
        aussieClock = '--:-- Uhr';
      }

      // Nächste Aktivität & Aktivitäten-Liste
      const primaryActivity = (dayData.activities && dayData.activities.length > 0) ? dayData.activities[0] : 'Tagesprogramm erkunden';
      const secondActivity = (dayData.activities && dayData.activities.length > 1) ? dayData.activities[1] : '';
      const customActs = (getCustomActivities()['day-' + dayNum] || []);

      const allActivitiesHtml = (dayData.activities && dayData.activities.length > 0)
        ? dayData.activities.map((a, idx) => `
            <li onclick="jumpToDayAndHighlight(${dayData.day})" style="cursor:pointer" title="Klicken: Im Tagesplan anzeigen">
              <i class="fa-solid fa-${idx === 0 ? 'star' : 'circle-check'}" style=""></i>
              <span>${escapeHtml(a)}</span>
            </li>
          `).concat(customActs.map(ca => `
            <li onclick="jumpToDayAndHighlight(${dayData.day})" style="cursor:pointer" title="Eigene Aktivität">
              <i class="fa-solid fa-plus-circle"></i>
              <span><strong>${escapeHtml(ca.time || 'Flexibel')}:</strong> ${escapeHtml(ca.text)}</span>
            </li>
          `)).join('')
        : '<li><i class="fa-solid fa-info"></i> <span>Entspannung &amp; Tageserkundung</span></li>';

      // Spots für diesen Tag
      const spotsForDay = ALL_SIGHTSEEING_SPOTS.filter(s => (dayData.spotIds || []).includes(s.id));
      const spotsHtml = spotsForDay.length > 0
        ? `
          <div class="dash-spots-row">
            <span style="font-size:0.7rem; font-weight:800; text-transform:uppercase; margin-right:0.2rem">
              <i class="fa-solid fa-camera"></i> Spots:
            </span>
            ${spotsForDay.map(s => `
              <span class="spot-chip" onclick="focusSpotOnMap(${s.id}, event)" title="Klicken: Spot '${escapeHtml(s.name)}' auf Karte ansehen">
                ${escapeHtml(s.name)}
              </span>
            `).join('')}
          </div>
        `
        : '';

      // Transport & Etappe
      let transportIcon = 'fa-car';
      let transportLabel = 'Mietwagen (Roadtrip)';
      if (dayData.transportType === 'flight') {
        transportIcon = 'fa-plane';
        transportLabel = dayNum === 1 ? 'Langstreckenflug' : 'Inlandsflug';
      } else if (dayData.transportType === 'transit') {
        if (dayData.distance && dayData.distance.includes('Fähre')) {
          transportIcon = 'fa-ship';
          transportLabel = 'Fähre & ÖPNV';
        } else if (dayData.accommodation && dayData.accommodation.includes('Nachtbus')) {
          transportIcon = 'fa-bus';
          transportLabel = 'Greyhound Nachtbus';
        } else {
          transportIcon = 'fa-train-subway';
          transportLabel = 'ÖPNV / Transfer';
        }
      }

      const nextRelevantPlace = getNextRelevantPlace(dayData, dayNum);

      // Unterkunft & Check-in
      const acc = getAccommodationDetails(dayNum);

      // Finanzen für diesen Tag
      const plannedExp = DAY_PLANNED_EXPENSES[dayNum] || { amount: 65, label: 'Tagesausgaben & Verpflegung' };
      const onsiteBase = getOnsiteSpendAmount() * currentMemoryDays().length;
      const dailyOnsiteBudget = getOnsiteSpendAmount();
      const spentSoFarEstimate = Math.round(dailyOnsiteBudget * (dayNum - 1));
      const remainingOnsite = Math.max(0, onsiteBase - spentSoFarEstimate);

      // Ausgaben aus dem Ausgaben-Tracker für heute abfragen
      const dayDateStr = TRIP_DAYS[dayNum - 1] ? TRIP_DAYS[dayNum - 1].date : '';
      const recordedForDay = (userExpenses || []).filter(e => e.dayNum === dayNum || (dayDateStr && e.date === dayDateStr));
      const recordedDaySumEur = recordedForDay.reduce((sum, e) => sum + (parseFloat(e.amountEur) || 0), 0);

      // Wetter vor Ort
      const cityKey = getWeatherCityForDay(dayNum);
      const cityLabel = getCityDisplayForDay(dayNum);
      const tempEl = document.getElementById(`weather-temp-${cityKey}`);
      const condEl = document.getElementById(`weather-cond-${cityKey}`);
      const windEl = document.getElementById(`weather-wind-${cityKey}`);
      const humEl = document.getElementById(`weather-hum-${cityKey}`);

      const liveTemp = tempEl ? tempEl.innerText : '25°C';
      const liveCond = condEl ? condEl.innerText : 'Angenehm & Heiter';
      const liveWind = windEl ? windEl.innerText : '14 km/h';
      const liveHum = humEl ? humEl.innerText : '58%';

      // Wetter-Tipp je nach Region
      let weatherTip = 'Sonnenschutz LSF 50+ & Trinkwasser einpacken!';
      if (cityKey === 'melbourne') {
        weatherTip = 'Typisches Melbourne-Wetter: Zwiebellook & leichte Windjacke empfohlen!';
      } else if (cityKey === 'brisbane') {
        weatherTip = 'Subtropisches Klima: Badetuch, Sonnenbrille & Badesachen bereithalten!';
      } else if (dayNum === 12 || dayNum === 14) {
        weatherTip = 'Wassersport & Strandtag: Dry-Bag & Riff-freundliche Sonnencreme!';
      }

      container.innerHTML = `
        <div class="dashboard-phase-banner during-trip">
          <div class="banner-top-row">
            <div class="banner-status-badge">
              <span class="banner-live-pulse"></span>
              LIVE REISESTATUS · Tag ${dayData.day} von 20
            </div>
            <div class="banner-date-badge">
              <i class="fa-regular fa-calendar-check"></i> ${fullDateStr} · 🇦🇺 ${aussieClock}
            </div>
          </div>

          <div class="banner-headline">Tag ${dayData.day}: ${escapeHtml(dayData.title)}</div>

          <div class="banner-subline">
            <i class="fa-solid fa-location-dot" style=""></i> <strong>Standort:</strong> ${escapeHtml(dayData.location)} · <strong>Tagesziel:</strong> ${escapeHtml(dayData.destination)}
          </div>

          <!-- Gesamtfortschritt der Reise -->
          <div class="dash-progress-wrap">
            <div class="dash-progress-meta">
              <span><i class="fa-solid fa-flag-checkered"></i> Gesamtfortschritt der Reise</span>
              <span><strong>${progressPercent}% abgeschlossen</strong> (Tag ${dayData.day} / 20)</span>
            </div>
            <div class="dash-progress-track">
              <div class="dash-progress-fill" style="width: ${progressPercent}%"></div>
            </div>
            <div class="dash-progress-sub">
              <span>${dayData.day === 20 ? '🏁 Letzter Reisetag der Reise!' : `Noch <strong>${20 - dayData.day} Reisetage</strong> bis zum Rückflug`}</span>
              <span><i class="fa-solid fa-road"></i> Heutige Etappe: ${escapeHtml(dayData.distance)}</span>
            </div>
          </div>

          <div class="banner-quick-actions">
            <button type="button" class="btn-banner-action" onclick="focusDayOnMap(${dayData.day}, event)">
              <i class="fa-solid fa-map-location-dot" style=""></i> Etappe auf Karte ansehen
            </button>
            <button type="button" class="btn-banner-action outline" onclick="jumpToDayAndHighlight(${dayData.day})">
              <i class="fa-solid fa-arrow-down"></i> Tagesplan Tag ${dayData.day} öffnen
            </button>
          </div>
        </div>

        <div class="dashboard-cards-grid">
          <!-- Card 1: Standort, Fahrt & Etappe -->
          <div class="dash-card">
            <div>
              <div class="dash-card-header">
                <div class="dash-card-icon" style="background:rgba(2, 132, 199, 0.12)"><i class="fa-solid fa-route"></i></div>
                <div class="dash-card-title">Standort &amp; Fahrt</div>
              </div>
              <div class="dash-card-body">
                <div class="cockpit-route-display">
                  <div class="route-point">
                    <span class="point-label">Startort</span>
                    <strong class="point-val" title="${escapeHtml(dayData.start)}">${escapeHtml(dayData.start)}</strong>
                  </div>
                  <div class="route-arrow">
                    <i class="fa-solid fa-arrow-right-long"></i>
                  </div>
                  <div class="route-point">
                    <span class="point-label">Tagesziel</span>
                    <strong class="point-val" title="${escapeHtml(dayData.destination)}">${escapeHtml(dayData.destination)}</strong>
                  </div>
                </div>

                <div class="dash-kpis-grid">
                  <div class="dash-kpi-pill">
                    <i class="fa-solid fa-road"></i>
                    <div>
                      <span class="kpi-label">Distanz</span>
                      <strong>${escapeHtml(dayData.distance)}</strong>
                    </div>
                  </div>
                  <div class="dash-kpi-pill">
                    <i class="fa-solid fa-clock"></i>
                    <div>
                      <span class="kpi-label">Fahrzeit</span>
                      <strong>${escapeHtml(dayData.driveTime)}</strong>
                    </div>
                  </div>
                  <div class="dash-kpi-pill">
                    <i class="fa-solid ${transportIcon}"></i>
                    <div>
                      <span class="kpi-label">Transport</span>
                      <strong>${transportLabel}</strong>
                    </div>
                  </div>
                </div>

                <div class="dash-card-desc" style="margin-top:0.4rem">
                  <i class="fa-solid fa-compass" style=""></i> <strong>Nächster Ort / Halt:</strong> ${escapeHtml(nextRelevantPlace)}
                </div>
              </div>
            </div>
            <div class="dash-card-actions">
              <button type="button" class="btn-dash-action primary" onclick="focusDayOnMap(${dayData.day}, event)">
                <i class="fa-solid fa-location-crosshairs"></i> Auf Karte fokussieren
              </button>
              <button type="button" class="btn-dash-action secondary" onclick="jumpToDayAndHighlight(${dayData.day})">
                <i class="fa-solid fa-map-pin"></i> Etappendetails
              </button>
            </div>
          </div>

          <!-- Card 2: Tagesprogramm & Highlights -->
          <div class="dash-card">
            <div>
              <div class="dash-card-header">
                <div class="dash-card-icon" style="background:rgba(217,107,39,0.12)"><i class="fa-solid fa-list-check"></i></div>
                <div class="dash-card-title">Tagesprogramm</div>
              </div>
              <div class="dash-card-body">
                <div class="dash-highlight-banner">
                  <span class="badge-gold"><i class="fa-solid fa-star"></i> Highlight</span>
                  <strong>${escapeHtml(primaryActivity)}</strong>
                </div>

                ${secondActivity ? `
                  <div class="dash-next-act">
                    <i class="fa-solid fa-forward-step" style=""></i> <strong>Als nächstes:</strong> ${escapeHtml(secondActivity)}
                  </div>
                ` : ''}

                <ul class="dash-card-list">
                  ${allActivitiesHtml}
                </ul>

                ${spotsHtml}
              </div>
            </div>
            <div class="dash-card-actions">
              <button type="button" class="btn-dash-action primary" onclick="jumpToDayAndHighlight(${dayData.day})">
                <i class="fa-solid fa-calendar-check"></i> Tagesplan öffnen
              </button>
            </div>
          </div>

          <!-- Card 3: Unterkunft & Check-in -->
          <div class="dash-card">
            <div>
              <div class="dash-card-header">
                <div class="dash-card-icon" style="background:rgba(16,185,129,0.12)"><i class="fa-solid fa-bed"></i></div>
                <div class="dash-card-title">Unterkunft &amp; Check-in</div>
              </div>
              <div class="dash-card-body">
                <div class="dash-card-primary-val" style="font-size:1.05rem">${escapeHtml(acc.name)}</div>
                <div class="dash-card-desc">
                  <i class="fa-solid fa-location-dot" style=""></i> ${escapeHtml(acc.address)}
                </div>

                <div class="checkin-times-pill-row">
                  <div class="time-pill checkin">
                    <i class="fa-solid fa-right-to-bracket"></i>
                    <span>Check-in:</span>
                    <strong>${escapeHtml(acc.checkIn)}</strong>
                  </div>
                  <div class="time-pill checkout">
                    <i class="fa-solid fa-right-from-bracket"></i>
                    <span>Check-out:</span>
                    <strong>${escapeHtml(acc.checkOut)}</strong>
                  </div>
                </div>

                <div class="dash-meta-row" style="margin-top:0.4rem">
                  <span class="dash-meta-badge" style="color:#10b981">
                    <i class="fa-solid fa-circle-check"></i> Vorab gebucht &amp; hinterlegt
                  </span>
                  <span class="dash-meta-badge">
                    <i class="fa-solid fa-moon"></i> Nacht ${dayData.day} von 20
                  </span>
                </div>
              </div>
            </div>
            <div class="dash-card-actions">
              ${acc.bookingUrl ? `
                <a href="${acc.bookingUrl}" target="_blank" rel="noopener noreferrer" class="btn-dash-action primary">
                  <i class="fa-solid fa-arrow-up-right-from-square"></i> ${escapeHtml(acc.bookingLabel)}
                </a>
              ` : ''}
              <button type="button" class="btn-dash-action" style="color:var(--primary)" onclick="openBookingsForDay(${dayData.day})" title="Buchungen zu Tag ${dayData.day} öffnen">
                <i class="fa-solid fa-receipt"></i> Buchungsdetails
              </button>
              <button type="button" class="btn-dash-action secondary" onclick="openCheckinSlide('${escapeHtml(acc.name)}')">
                <i class="fa-solid fa-hotel"></i> Check-in Details
              </button>
            </div>
          </div>

          <!-- Card 4: Live-Wetter vor Ort -->
          <div class="dash-card">
            <div>
              <div class="dash-card-header">
                <div class="dash-card-icon" style="background:rgba(2,132,199,0.12)"><i class="fa-solid fa-cloud-sun"></i></div>
                <div class="dash-card-title">Wetter vor Ort</div>
              </div>
              <div class="dash-card-body">
                <div class="dash-card-primary-val" style="font-size:1.05rem">${cityLabel}</div>
                <div class="dash-weather-box">
                  <div class="dash-weather-icon"><i class="fa-solid fa-sun" style=""></i></div>
                  <div>
                    <div class="dash-weather-temp">${liveTemp}</div>
                    <div class="dash-weather-meta">${liveCond} · Wind ${liveWind} · Feuchte ${liveHum}</div>
                  </div>
                </div>
                <div class="dash-card-desc" style="margin-top:0.6rem; font-size:0.8rem">
                  <i class="fa-solid fa-circle-info" style=""></i> ${weatherTip}
                </div>
              </div>
            </div>
            <div class="dash-card-actions">
              <button type="button" class="btn-dash-action secondary" onclick="fetchLiveWeather(true)">
                <i class="fa-solid fa-rotate"></i> Aktualisieren
              </button>
              <a href="#weather" class="btn-dash-action secondary">
                <i class="fa-solid fa-umbrella"></i> 3-Städte Wetter
              </a>
            </div>
          </div>

          <!-- Card 5: Geplante Ausgaben & Budget -->
          <div class="dash-card">
            <div>
              <div class="dash-card-header">
                <div class="dash-card-icon" style="background:rgba(217,119,6,0.12)"><i class="fa-solid fa-wallet"></i></div>
                <div class="dash-card-title">Budget &amp; Tagesausgaben</div>
              </div>
              <div class="dash-card-body">
                <div class="dash-card-primary-val" style="font-size:1.05rem">Heutige Kosten: ca. ${plannedExp.amount} € p.P.</div>
                <div class="dash-card-desc">
                  <strong>Zweck:</strong> ${escapeHtml(plannedExp.label)}
                </div>

                <div class="dash-budget-meta-grid">
                  <div>
                    <span class="lbl">Tages-Taschengeld</span>
                    <strong>ca. ${dailyOnsiteBudget} € / Tag</strong>
                  </div>
                  <div>
                    <span class="lbl">Heute erfasst</span>
                    <strong style="${recordedDaySumEur > 0 ? 'color:var(--primary);' : ''}">
                      ${recordedDaySumEur > 0 ? recordedDaySumEur.toFixed(2) + ' € (' + recordedForDay.length + ' Beleg' + (recordedForDay.length > 1 ? 'e' : '') + ')' : '0,00 €'}
                    </strong>
                  </div>
                  <div style="grid-column: 1 / -1">
                    <span class="lbl">Verbleibend Vor-Ort (Taschengeld)</span>
                    <strong style="">ca. ${remainingOnsite} € p.P.</strong>
                    <span style="font-size:0.72rem; display:inline-block; margin-left:0.3rem">(für noch ${20 - dayNum + 1} Tage)</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="dash-card-actions">
              <button type="button" class="btn-dash-action primary" onclick="openExpenseModal(null, ${dayData.day})">
                <i class="fa-solid fa-plus-circle"></i> Ausgabe erfassen
              </button>
              <button type="button" class="btn-dash-action secondary" onclick="openBudgetDetails('onsite-spend-card')">
                <i class="fa-solid fa-sliders"></i> Budget-Verwaltung
              </button>
              <button type="button" class="btn-dash-action secondary" onclick="openFuelTracker()">
                <i class="fa-solid fa-gas-pump"></i> Tankrechnung
              </button>
            </div>
          </div>
        </div>
      `;
    }

    // 3. NACH DER REISE
    function renderDashboardPostTrip(container) {
      if (container.dataset.renderedPhase === 'post') {
        return;
      }
      container.dataset.renderedPhase = 'post';

      const totalKm = 'ca. 2.100 km Mietwagen + ca. 2.560 km Inlandsflüge';
      const personToggle = document.getElementById('person-toggle');
      const isPerPerson = personToggle ? personToggle.checked : true;
      const totalAmountEl = document.getElementById('total-sum-badge') || document.getElementById('kpi-total-budget');
      const totalBudgetStr = totalAmountEl ? totalAmountEl.innerText.replace('Gesamt:', '').trim() : 'ca. 2.772 € p.P.';

      container.innerHTML = `
        <div class="dashboard-phase-banner post-trip">
          <div class="banner-status-badge"><i class="fa-solid fa-flag-checkered"></i> Reise abgeschlossen · Willkommen zurück!</div>
          <div class="banner-headline">Australien Roadtrip erfolgreich abgeschlossen! 🦘🇦🇺🎉</div>
          <div class="banner-subline">
            20 unvergessliche Tage von Wien über Sydney, Byron Bay, Brisbane, Noosa, K'gari &amp; Whitsundays bis Melbourne und die Great Ocean Road.
          </div>

          <div style="display:flex; flex-wrap:wrap; gap:0.6rem; margin-top:0.75rem">
            <button type="button" class="btn-dash-action" style="color:#0f172a; font-weight:800" onclick="focusDayOnMap(null)">
              <i class="fa-solid fa-map" style=""></i> Gesamte Reiseroute auf Karte ansehen
            </button>
            <button type="button" class="btn-dash-action" style="color:#ffffff" onclick="jumpToDayAndHighlight(1)">
              <i class="fa-solid fa-calendar-days"></i> Reiseplan von Tag 1 an durchblättern
            </button>
          </div>
        </div>

        <div class="dashboard-cards-grid">
          <!-- Card 1: Reisedauer & Tage -->
          <div class="dash-card">
            <div>
              <div class="dash-card-header">
                <div class="dash-card-icon"><i class="fa-solid fa-calendar-check"></i></div>
                <div class="dash-card-title">Reisedauer &amp; Etappen</div>
              </div>
              <div class="dash-card-body">
                <div class="dash-card-primary-val">21 Reisetage geplant</div>
                <div class="dash-card-desc">
                  Reisezeitraum: <strong>21.03.2027 bis 09.04.2027</strong><br>
                  Besuchte Bundesstaaten: <strong>New South Wales, Queensland &amp; Victoria</strong>
                </div>
                <ul class="dash-card-list">
                  <li><i class="fa-solid fa-check"></i> <span>20 vollständige Tagesprogramme</span></li>
                  <li><i class="fa-solid fa-check"></i> <span>4 Personen (Tobi, Lara, Ker, Flo)</span></li>
                </ul>
              </div>
            </div>
            <div class="dash-card-actions">
              <button type="button" class="btn-dash-action secondary" onclick="jumpToDayAndHighlight(20)">
                <i class="fa-solid fa-clock-rotate-left"></i> Tag 20 Abschlussbericht
              </button>
            </div>
          </div>

          <!-- Card 2: Gefahrene Kilometer -->
          <div class="dash-card">
            <div>
              <div class="dash-card-header">
                <div class="dash-card-icon" style="background:rgba(217,107,39,0.12)"><i class="fa-solid fa-road"></i></div>
                <div class="dash-card-title">Gefahrene Kilometer</div>
              </div>
              <div class="dash-card-body">
                <div class="dash-card-primary-val">ca. 5.520 km in Australien</div>
                <ul class="dash-card-list">
                  <li><i class="fa-solid fa-car"></i> <span><strong>ca. 2.100 km</strong> Mietwagen Roadtrip</span></li>
                  <li><i class="fa-solid fa-plane"></i> <span><strong>ca. 2.560 km</strong> 2 Inlandsflüge (SYD➔BNK, PPP➔MEL)</span></li>
                  <li><i class="fa-solid fa-bus"></i> <span><strong>ca. 860 km</strong> K’gari ➔ Airlie Beach Nachtbus</span></li>
                  <li><i class="fa-solid fa-globe"></i> <span><strong>ca. 31.800 km</strong> Langstrecke VIE ⇄ Australien</span></li>
                </ul>
              </div>
            </div>
            <div class="dash-card-actions">
              <button type="button" class="btn-dash-action primary" onclick="focusDayOnMap(18)">
                <i class="fa-solid fa-route"></i> Great Ocean Road Route
              </button>
            </div>
          </div>

          <!-- Card 3: Gesamtausgaben -->
          <div class="dash-card">
            <div>
              <div class="dash-card-header">
                <div class="dash-card-icon" style="background:rgba(16,185,129,0.12)"><i class="fa-solid fa-coins"></i></div>
                <div class="dash-card-title">Gesamtausgaben &amp; Abrechnung</div>
              </div>
              <div class="dash-card-body">
                <div class="dash-card-primary-val">${totalBudgetStr}</div>
                <div class="dash-card-desc">
                  Umfasst alle Flüge, Unterkünfte, Mietwagen, Sprit, Aktivitäten &amp; Vor-Ort Verpflegung.
                </div>
                <div class="dash-card-meta-row">
                  <span class="dash-meta-badge highlight"><i class="fa-solid fa-circle-check"></i> Alle Posten erfasst</span>
                  <span class="dash-meta-badge"><i class="fa-solid fa-users"></i> 4 Personen Abrechnung</span>
                </div>
              </div>
            </div>
            <div class="dash-card-actions">
              <button type="button" class="btn-dash-action primary" onclick="openBudgetDetails('budget-details-slide')">
                <i class="fa-solid fa-chart-pie"></i> Vollständige Kostenaufstellung
              </button>
            </div>
          </div>

          <!-- Card 4: Sightseeing-Highlights -->
          <div class="dash-card">
            <div>
              <div class="dash-card-header">
                <div class="dash-card-icon" style="background:rgba(139,92,246,0.12)"><i class="fa-solid fa-camera"></i></div>
                <div class="dash-card-title">Highlights &amp; Erinnerungen</div>
              </div>
              <div class="dash-card-body">
                <div class="dash-card-primary-val">27 Sightseeing-Highlights</div>
                <div class="dash-card-desc">
                  Sydney Harbour &amp; Bondi · Cape Byron &amp; Delfine · Brisbane South Bank · Noosa Fairy Pools · K'gari Fraser Island · Whitsundays &amp; Whitehaven · Melbourne Laneways · Twelve Apostles.
                </div>
              </div>
            </div>
            <div class="dash-card-actions">
              <button type="button" class="btn-dash-action secondary" onclick="focusSpotOnMap(18)">
                <i class="fa-solid fa-umbrella-beach"></i> Whitehaven Beach Pin
              </button>
            </div>
          </div>
        </div>
      `;
    }

    function updateLiveTripStatus() {
      updateTripDashboard();
      const widget = document.getElementById('hero-trip-status-widget');
      if (!widget) return;

      const state = determineCurrentTripState();

      if (state.phase === 'pre') {
        const now = new Date();
        const tripStart = new Date("2027-03-21T10:00:00+01:00");
        let diff = tripStart.getTime() - now.getTime();
        if (diff < 0) diff = 0;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const seconds = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');

        const cdSpan = document.getElementById('hero-countdown-span');
        if (cdSpan) {
          cdSpan.innerHTML = `Noch <strong>${days}</strong> Tage, <strong>${hours}</strong>:<strong>${minutes}</strong>:<strong>${seconds}</strong> bis zum Abflug in Wien 🇦🇹 ✈️ 🇦🇺`;
        } else {
          widget.innerHTML = `
            <div class="hero-status-card pre-trip" onclick="document.getElementById('dashboard').scrollIntoView({behavior:'smooth'})" role="button" tabindex="0" title="Klicken: Zum Reise-Dashboard springen">
              <div class="hero-status-tag"><i class="fa-solid fa-hourglass-half"></i> Countdown zum Abflug</div>
              <div class="hero-status-title">⏳ <span id="hero-countdown-span">Noch <strong>${days}</strong> Tage, <strong>${hours}</strong>:<strong>${minutes}</strong>:<strong>${seconds}</strong> bis zum Abflug in Wien 🇦🇹 ✈️ 🇦🇺</span></div>
              <div class="hero-status-sub">Scoot Flug TR 12 · Abflug am 21. März 2027 um 10:00 Uhr · <span style="text-decoration:underline">Zum Trip-Cockpit ➔</span></div>
            </div>
          `;
        }
      } else if (state.phase === 'during') {
        const dayData = TRIP_DAYS_DATA.find(d => d.day === state.dayNum) || TRIP_DAYS_DATA[0];
        const progressPercent = Math.round((dayData.day / 20) * 100);

        widget.innerHTML = `
          <div class="hero-status-card during-trip" onclick="document.getElementById('dashboard').scrollIntoView({behavior:'smooth'})" role="button" tabindex="0" title="Klicken: Direkt zum Trip-Cockpit für Tag #${dayData.day} springen">
            <div class="hero-status-badge-live"><span class="live-dot-pulse"></span> LIVE REISESTATUS · Tag ${dayData.day} von 20 (${progressPercent}%)</div>
            <div class="hero-status-title">📍 LIVE HEUTE: Tag ${dayData.day} (${dayData.date}) | ${escapeHtml(dayData.title)}</div>
            <div class="hero-status-sub" style="margin-top:0.35rem; font-size:0.86rem; opacity:0.95">
              <span>🏁 ${escapeHtml(dayData.start)} ➔ ${escapeHtml(dayData.destination)}</span> · <span>${escapeHtml(dayData.distance)}</span>
            </div>
            <div class="hero-status-jump"><i class="fa-solid fa-compass"></i> Zum Trip-Cockpit öffnen ➔</div>
          </div>
        `;
      } else {
        // Nach der Reise (ab 10.04.2027)
        widget.innerHTML = `
          <div class="hero-status-card post-trip" onclick="document.getElementById('dashboard').scrollIntoView({behavior:'smooth'})" role="button" tabindex="0" title="Klicken: Zur Reise-Rückschau im Dashboard springen">
            <div class="hero-status-tag"><i class="fa-solid fa-circle-check"></i> Reise abgeschlossen</div>
            <div class="hero-status-title">Trip erfolgreich beendet – Willkommen zurück in der Heimat! 🦘🇦🇺🎉</div>
            <div class="hero-status-sub">20 Tage Roadtrip &amp; ca. 5.520 km in Australien absolviert · <span style="text-decoration:underline">Zur Reise-Rückschau ➔</span></div>
          </div>
        `;
      }
    }

    // =========================================================================
    // CUSTOM ACTIVITIES (LOCALSTORAGE & CLOUD SYNC)
    // =========================================================================
    const CUSTOM_ACTIVITIES_KEY = 'aus_roadtrip_custom_activities_2027';

    function getCustomActivities() {
      try {
        const raw = localStorage.getItem(CUSTOM_ACTIVITIES_KEY);
        return raw ? JSON.parse(raw) : {};
      } catch (e) {
        return {};
      }
    }

    function saveCustomActivities(data) {
      try {
        localStorage.setItem(CUSTOM_ACTIVITIES_KEY, JSON.stringify(data));
        return true;
      } catch (e) { return storageFailure(e); }
    }

    function renderCustomActivities() {
      const allActs = getCustomActivities();
      for (let day = 1; day <= 20; day++) {
        const container = document.getElementById('act-list-day-' + day);
        if (!container) continue;
        container.querySelectorAll('.custom-act-row').forEach(el => el.remove());

        const dayActs = allActs['day-' + day] || [];
        dayActs.forEach(act => {
          const row = document.createElement('div');
          row.className = 'activity-row custom-act-row';
          row.innerHTML = `
            <span class="activity-time custom">${escapeHtml(act.time || '--:--')}</span>
            <span class="activity-desc">${escapeHtml(act.text)}</span>
            <button class="act-del-btn" onclick="deleteCustomActivity(${day}, '${act.id}')" title="Aktivität löschen">
              <i class="fa-solid fa-xmark"></i>
            </button>
          `;
          container.appendChild(row);
        });
      }
    }

    function addCustomActivity(dayNum) {
      const timeInput = document.getElementById('act-time-day-' + dayNum);
      const descInput = document.getElementById('act-desc-day-' + dayNum);
      if (!descInput) return;
      const text = descInput.value.trim();
      if (!text) return;
      const time = timeInput ? timeInput.value : '';

      const allActs = getCustomActivities();
      const dayKey = 'day-' + dayNum;
      if (!allActs[dayKey]) allActs[dayKey] = [];

      const newAct = {
        id: 'act_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        time: time || 'Flexibel',
        text: text
      };

      allActs[dayKey].push(newAct);
      if (!saveCustomActivities(allActs)) return;
      descInput.value = '';
      if (timeInput) timeInput.value = '';

      renderCustomActivities();
      if (typeof broadcastState === 'function') {
        broadcastState();
      }
    }

    function deleteCustomActivity(dayNum, actId) {
      const allActs = getCustomActivities();
      const dayKey = 'day-' + dayNum;
      if (!allActs[dayKey]) return;
      allActs[dayKey] = allActs[dayKey].filter(a => a.id !== actId);
      if (!saveCustomActivities(allActs)) return;
      renderCustomActivities();
      if (typeof broadcastState === 'function') {
        broadcastState();
      }
    }

    function changeTimezone(tz) {
      currentSelectedTz = tz || 'Australia/Sydney';
      const tzSelect = document.getElementById('timezone-select');
      if (tzSelect && tzSelect.value !== currentSelectedTz) tzSelect.value = currentSelectedTz;
      updateDualClocks();
      updateLiveTripStatus();
      if (typeof broadcastState === 'function') {
        broadcastState();
      }
    }

    function updateDualClocks() {
      const now = new Date();
      const tzSelect = document.getElementById('timezone-select');
      const selectedTz = (tzSelect && tzSelect.value && tzSelect.value.trim()) ? tzSelect.value.trim() : (currentSelectedTz || 'Australia/Sydney');
      const aussieEl = document.getElementById('aussie-time');
      if (aussieEl) {
        try {
          aussieEl.innerText = now.toLocaleTimeString('de-DE', { timeZone: selectedTz, hour: '2-digit', minute: '2-digit' }) + ' Uhr';
        } catch (e) {
          aussieEl.innerText = now.toLocaleTimeString('de-DE', { timeZone: 'Australia/Sydney', hour: '2-digit', minute: '2-digit' }) + ' Uhr';
        }
      }
      const viennaEl = document.getElementById('vienna-time');
      if (viennaEl) {
        try {
          viennaEl.innerText = now.toLocaleTimeString('de-DE', { timeZone: 'Europe/Vienna', hour: '2-digit', minute: '2-digit' }) + ' Uhr';
        } catch (e) {
          viennaEl.innerText = '--:-- Uhr';
        }
      }
    }
    setInterval(updateDualClocks, 1000);
    updateDualClocks();


    // =========================================================================
    // ERWEITERTES BUDGETSYSTEM: 8 KATEGORIEN, KPI-BERECHNUNG & AUSGABEN CRUD
    // =========================================================================
    const EXPENSES_STORAGE_KEY = 'aus_roadtrip_expenses_2027';
    const OFFLINE_RATE_KEY = 'aus_last_known_aud_rate';
    const OFFLINE_RATE_TIME_KEY = 'aus_last_known_aud_rate_time';

    const BUDGET_CATEGORIES_CONFIG = {
      flights: { id: 'flights', label: 'Flüge', plannedEurP: 1093, color: '#006d68', icon: 'fa-plane' },
      hotels: { id: 'hotels', label: 'Unterkunft', plannedEurP: 648.5, color: '#d96b27', icon: 'fa-hotel' },
      car: { id: 'car', label: 'Mietwagen', plannedEurP: 245, color: '#0284c7', icon: 'fa-car' },
      fuel: { id: 'fuel', label: 'Benzin', plannedEurP: 120, color: '#eab308', icon: 'fa-gas-pump' },
      food: { id: 'food', label: 'Essen & Drinks', plannedEurP: 350, color: '#10b981', icon: 'fa-utensils' },
      activities: { id: 'activities', label: 'Aktivitäten', plannedEurP: 603, color: '#8b5cf6', icon: 'fa-ticket' },
      groceries: { id: 'groceries', label: 'Einkäufe', plannedEurP: 180, color: '#ec4899', icon: 'fa-cart-shopping' },
      misc: { id: 'misc', label: 'Sonstiges', plannedEurP: 168.5, color: '#64748b', icon: 'fa-box-archive' }
    };

    // Standard-Startausgaben (bereits gebuchte und bezahlte Flüge)
    const DEFAULT_EXPENSES_LIST = [
      {
        id: 'exp-1',
        title: 'Flug Wien → Sydney (Scoot TR 12)',
        date: '2027-03-21',
        dayNum: 1,
        category: 'flights',
        amountEur: 1812, // 453 € * 4
        amountAud: Math.round(1812 / 0.6209),
        currency: 'EUR',
        payer: 'Gruppe',
        note: 'Langstreckenflug für alle 4 Personen gebucht & bezahlt'
      },
      {
        id: 'exp-2',
        title: 'Flug Sydney → Ballina / Byron Bay (Virgin VA 1141)',
        date: '2027-03-25',
        dayNum: 5,
        category: 'flights',
        amountEur: 216, // 54 € * 4
        amountAud: Math.round(216 / 0.6209),
        currency: 'EUR',
        payer: 'Gruppe',
        note: 'Inlandsflug für 4 Personen gebucht & bezahlt'
      },
      {
        id: 'exp-3',
        title: 'Flug Proserpine → Melbourne (Jetstar JQ 843)',
        date: '2027-04-05',
        dayNum: 16,
        category: 'flights',
        amountEur: 540, // 135 € * 4
        amountAud: Math.round(540 / 0.6209),
        currency: 'EUR',
        payer: 'Gruppe',
        note: 'Inlandsflug für 4 Personen gebucht & bezahlt'
      },
      {
        id: 'exp-4',
        title: 'Rückflug Melbourne → Wien (Scoot TR 25)',
        date: '2027-04-09',
        dayNum: 20,
        category: 'flights',
        amountEur: 1804, // 451 € * 4
        amountAud: Math.round(1804 / 0.6209),
        currency: 'EUR',
        payer: 'Gruppe',
        note: 'Rückflug für 4 Personen gebucht & bezahlt'
      }
    ];


    // =========================================================================
    // BUCHUNGS- UND ZAHLUNGSSTATUS FÜR KOSTENPOSITIONEN
    // =========================================================================
    const SUB_ITEMS_PAID_STORAGE_KEY = 'aus_subitems_paid_state_2027';

    function getSubItemsPaidState() {
      try {
        const raw = localStorage.getItem(SUB_ITEMS_PAID_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) { }
      // Standard: Die 4 Flüge sind vorab gebucht & bezahlt
      return {
        'flight-1': true,
        'flight-2': true,
        'flight-3': true,
        'flight-4': true
      };
    }

    function saveSubItemsPaidState(state) {
      try {
        localStorage.setItem(SUB_ITEMS_PAID_STORAGE_KEY, JSON.stringify(state));
        return true;
      } catch (e) { return storageFailure(e); }
    }

    function toggleSubItemPaid(itemId, isChecked) {
      const state = getSubItemsPaidState();
      state[itemId] = !!isChecked;
      if (!saveSubItemsPaidState(state)) return;
      applySubItemsPaidStateToUI();
      updateBudgetCalculations();
      if (typeof broadcastState === 'function') broadcastState();
    }

    function applySubItemsPaidStateToUI() {
      const state = getSubItemsPaidState();
      document.querySelectorAll('.sub-price-item').forEach(item => {
        const itemId = item.getAttribute('data-item-id');
        if (!itemId) return;

        const isPaid = !!state[itemId];
        item.setAttribute('data-paid', isPaid ? 'true' : 'false');

        const cb = item.querySelector('.sub-paid-cb');
        if (cb) cb.checked = isPaid;

        const pill = item.querySelector('.paid-status-pill');
        if (pill) {
          pill.className = `paid-status-pill ${isPaid ? 'is-paid' : 'is-planned'}`;
          pill.innerHTML = isPaid
            ? '<i class="fa-solid fa-circle-check"></i> Gebucht &amp; bezahlt'
            : '<i class="fa-regular fa-circle"></i> Geplant';
        }
      });
    }

    let userExpenses = [];
    let currentBudgetChartTab = 'cat'; // 'cat' | 'daily' | 'vs'

    function loadUserExpenses() {
      try {
        const raw = localStorage.getItem(EXPENSES_STORAGE_KEY);
        if (raw) {
          userExpenses = JSON.parse(raw);
        } else {
          userExpenses = [...DEFAULT_EXPENSES_LIST];
          if (!saveUserExpenses()) return;
        }
      } catch (e) {
        userExpenses = [...DEFAULT_EXPENSES_LIST];
      }
    }

    function saveUserExpenses() {
      try {
        localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(userExpenses));
        return true;
      } catch (e) { return storageFailure(e); }
    }

    // Modal Funktionen
    function openExpenseModal(editId = null, targetDayNum = null) {
      const backdrop = document.getElementById('expense-modal-backdrop');
      const titleEl = document.getElementById('expense-modal-title-text');
      const idInput = document.getElementById('exp-edit-id');
      const titleInput = document.getElementById('exp-input-title');
      const dateInput = document.getElementById('exp-input-date');
      const catSelect = document.getElementById('exp-input-cat');
      const amountInput = document.getElementById('exp-input-amount');
      const currSelect = document.getElementById('exp-input-curr');
      const payerSelect = document.getElementById('exp-input-payer');

      if (!backdrop) return;

      const personsInput = document.getElementById('exp-input-persons');
      if (editId) {
        const exp = userExpenses.find(e => e.id === editId);
        if (exp) {
          titleEl.innerText = 'Ausgabe bearbeiten';
          idInput.value = exp.id;
          titleInput.value = exp.title || '';
          dateInput.value = exp.date || '2027-03-21';
          catSelect.value = exp.category || 'misc';
          amountInput.value = exp.currency === 'AUD' ? exp.amountAud : exp.amountEur;
          currSelect.value = exp.currency || 'EUR';
          payerSelect.value = exp.payer || 'Gruppe';
          if (personsInput) personsInput.value = exp.persons || 4;
        }
      } else {
        titleEl.innerText = 'Ausgabe erfassen';
        idInput.value = '';
        titleInput.value = '';
        let defaultDate = '2027-03-21';
        if (targetDayNum && TRIP_DAYS[targetDayNum - 1]) {
          defaultDate = TRIP_DAYS[targetDayNum - 1].date;
        }
        dateInput.value = defaultDate;
        catSelect.value = 'food';
        amountInput.value = '';
        currSelect.value = 'AUD';
        payerSelect.value = 'Gruppe';
        if (personsInput) personsInput.value = 4;
      }

      updateExpenseModalPreview();
      backdrop.classList.add('open');
      setTimeout(() => { if (titleInput) titleInput.focus(); }, 100);
    }

    function closeExpenseModal() {
      const backdrop = document.getElementById('expense-modal-backdrop');
      if (backdrop) backdrop.classList.remove('open');
    }

    function updateExpenseModalPreview() {
      const amountVal = parseFloat(document.getElementById('exp-input-amount').value) || 0;
      const personsVal = Math.max(1, parseInt(document.getElementById('exp-input-persons') ? document.getElementById('exp-input-persons').value : 4, 10) || 1);
      const curr = document.getElementById('exp-input-curr').value;
      const preview = document.getElementById('exp-modal-preview');
      if (!preview) return;

      const rate = (typeof currentAudToEurRate === 'number' && currentAudToEurRate > 0) ? currentAudToEurRate : 0.6209;
      const totalEur = curr === 'AUD' ? (amountVal * rate) : amountVal;
      const totalAud = curr === 'AUD' ? amountVal : (amountVal / rate);
      const perPersonEur = totalEur / personsVal;
      const perPersonAud = totalAud / personsVal;

      preview.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.4rem">
          <div>Gesamt: <strong>${totalEur.toFixed(2)} €</strong> <span style="font-size:0.74rem">(ca. ${totalAud.toFixed(2)} AUD)</span></div>
          <div style="font-weight:800; font-size:0.9rem">
            👉 <strong>${perPersonEur.toFixed(2)} €</strong> p.P. <span style="font-size:0.72rem; font-weight:600">(bei ${personsVal} Person${personsVal > 1 ? 'en' : ''})</span>
          </div>
        </div>
      `;
    }

    function saveExpenseFromModal() {
      const id = document.getElementById('exp-edit-id').value;
      const title = document.getElementById('exp-input-title').value.trim();
      const date = document.getElementById('exp-input-date').value;
      const category = document.getElementById('exp-input-cat').value;
      const amount = parseFloat(document.getElementById('exp-input-amount').value) || 0;
      const currency = document.getElementById('exp-input-curr').value;
      const payer = document.getElementById('exp-input-payer').value;
      const persons = Math.max(1, parseInt(document.getElementById('exp-input-persons') ? document.getElementById('exp-input-persons').value : 4, 10) || 1);

      if (!title || amount <= 0) return;

      const rate = (typeof currentAudToEurRate === 'number' && currentAudToEurRate > 0) ? currentAudToEurRate : 0.6209;
      let amountEur = 0;
      let amountAud = 0;

      if (currency === 'AUD') {
        amountAud = amount;
        amountEur = Math.round((amount * rate) * 100) / 100;
      } else {
        amountEur = amount;
        amountAud = Math.round((amount / rate) * 100) / 100;
      }

      // Reisetag ermitteln (falls Datum im Trip liegt)
      let dayNum = 1;
      const dayItem = TRIP_DAYS.find(d => d.date === date);
      if (dayItem) dayNum = dayItem.day;

      if (id) {
        // Bearbeiten
        const idx = userExpenses.findIndex(e => e.id === id);
        if (idx !== -1) {
          userExpenses[idx] = {
            ...userExpenses[idx],
            title,
            date,
            dayNum,
            category,
            amountEur,
            amountAud,
            currency,
            payer
          };
        }
      } else {
        // Neu hinzufügen
        const newId = 'exp-' + Date.now();
        userExpenses.unshift({
          id: newId,
          title,
          date,
          dayNum,
          category,
          amountEur,
          amountAud,
          currency,
          payer,
          note: ''
        });
      }

      if (!saveUserExpenses()) return;
      closeExpenseModal();
      renderExpenseList();
      updateBudgetCalculations();
      const dashContainer = document.getElementById('trip-dashboard-content');
      if (dashContainer) dashContainer.dataset.renderedPhase = '';
      updateTripDashboard();
      if (typeof broadcastState === 'function') broadcastState();
    }

    function deleteExpense(id) {
      userExpenses = userExpenses.filter(e => String(e.id) !== String(id));
      if (!saveUserExpenses()) return;
      renderExpenseList();
      updateBudgetCalculations();
      const dashContainer = document.getElementById('trip-dashboard-content');
      if (dashContainer) dashContainer.dataset.renderedPhase = '';
      updateTripDashboard();
      if (typeof broadcastState === 'function') broadcastState();
    }

    function renderExpenseList() {
      const container = document.getElementById('expense-items-list');
      const countEl = document.getElementById('expense-count-summary');
      if (!container) return;

      const catFilter = document.getElementById('expense-filter-cat') ? document.getElementById('expense-filter-cat').value : 'all';
      const payerFilter = document.getElementById('expense-filter-payer') ? document.getElementById('expense-filter-payer').value : 'all';

      let filtered = userExpenses.filter(e => {
        if (catFilter !== 'all' && e.category !== catFilter) return false;
        if (payerFilter !== 'all' && e.payer !== payerFilter) return false;
        return true;
      });

      if (countEl) {
        const totalEur = filtered.reduce((sum, e) => sum + e.amountEur, 0);
        countEl.innerText = `${filtered.length} Ausgaben (${Math.round(totalEur).toLocaleString('de-DE')} € gesamt)`;
      }

      if (filtered.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 2rem 1rem; font-size: 0.88rem">
            <i class="fa-solid fa-folder-open" style="font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.6; display: block"></i>
            Keine Ausgaben für diesen Filter gefunden. Klicke auf <strong>Ausgabe hinzufügen</strong>, um eine neue Ausgabe zu erfassen.
          </div>
        `;
        return;
      }

      container.innerHTML = filtered.map(exp => {
        const catCfg = BUDGET_CATEGORIES_CONFIG[exp.category] || BUDGET_CATEGORIES_CONFIG.misc;
        const formattedDate = exp.date ? exp.date.split('-').reverse().join('.') : '';
        return `
          <div class="expense-row-item" id="exp-row-${exp.id}">
            <div class="expense-item-left">
              <div class="expense-cat-badge" style="color: ${catCfg.color}" title="${escapeHtml(catCfg.label)}">
                <i class="fa-solid ${catCfg.icon}"></i>
              </div>
              <div class="expense-info-box">
                <div class="expense-title">${escapeHtml(exp.title)}</div>
                <div class="expense-meta-line">
                  <span><i class="fa-regular fa-calendar"></i> ${formattedDate} (Tag ${exp.dayNum || 1})</span>
                  <span>•</span>
                  <span><i class="fa-solid fa-tag"></i> ${escapeHtml(catCfg.label)}</span>
                  <span>•</span>
                  <span class="payer-badge ${String(exp.payer).toLowerCase()}">${escapeHtml(exp.payer)}</span>
                </div>
              </div>
            </div>

            <div class="expense-item-right">
              <div class="expense-amount-box">
                <div class="expense-amount-main">${Math.round(exp.amountEur).toLocaleString('de-DE')} €</div>
                <div class="expense-amount-sub">${(exp.amountEur / (exp.persons || 4)).toFixed(2)} € p.P. • ca. ${Math.round(exp.amountAud)} AUD</div>
              </div>
              <div class="expense-actions">
                <button type="button" class="btn-exp-action" onclick="openExpenseModal('${exp.id}')" title="Bearbeiten">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button type="button" class="btn-exp-action delete" onclick="deleteExpense('${exp.id}')" title="Löschen">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Chart Tabs Umschaltung
    function switchBudgetChartTab(tabKey) {
      currentBudgetChartTab = tabKey;
      document.querySelectorAll('.budget-chart-tab-btn').forEach(btn => btn.classList.remove('active'));
      const activeBtn = document.getElementById('tab-btn-' + tabKey);
      if (activeBtn) activeBtn.classList.add('active');

      const viewCat = document.getElementById('chart-view-cat');
      const viewDaily = document.getElementById('chart-view-daily');
      const viewVs = document.getElementById('chart-view-vs');
      const onsiteLabel = document.getElementById('wrap-chart-include-onsite');

      if (viewCat) viewCat.style.display = tabKey === 'cat' ? 'block' : 'none';
      if (viewDaily) viewDaily.style.display = tabKey === 'daily' ? 'block' : 'none';
      if (viewVs) viewVs.style.display = tabKey === 'vs' ? 'block' : 'none';
      if (onsiteLabel) onsiteLabel.style.display = tabKey === 'cat' ? 'flex' : 'none';

      renderCurrentBudgetChart();
    }

    function renderCurrentBudgetChart() {
      if (currentBudgetChartTab === 'cat') {
        renderBudgetDoughnutChart();
      } else if (currentBudgetChartTab === 'daily') {
        renderDailyBudgetBarChart();
      } else if (currentBudgetChartTab === 'vs') {
        renderPlannedVsActualChart();
      }
    }

    function updateBudgetCalculations() {
      const personToggle = document.getElementById('person-toggle');
      const isPerPerson = personToggle ? personToggle.checked : true;
      const multiplier = isPerPerson ? 1 : 4;
      const toggleDot = document.getElementById('toggle-dot');
      if (toggleDot) toggleDot.style.transform = isPerPerson ? 'translateX(24px)' : 'translateX(0px)';

      // 1. Spritrechner Live-Anteil
      const fuelItem = document.getElementById('budget-fuel-item');
      let totalFuelEur = 0;
      if (fuelItem) {
        totalFuelEur = fuelEntries.reduce((sum, item) => {
          const cEur = parseFloat(item.costEur) || ((parseFloat(item.costAud) || 0) * currentAudToEurRate);
          return sum + cEur;
        }, 0);
        const fuelPerPersonEur = totalFuelEur / 4;
        fuelItem.setAttribute('data-eur', fuelPerPersonEur.toFixed(2));
        const fuelVal = document.getElementById('budget-fuel-val');
        if (fuelVal) {
          const displayVal = isPerPerson ? fuelPerPersonEur : totalFuelEur;
          fuelVal.innerText = `${displayVal.toFixed(0)} €`;
        }
      }

      // 2. Summe aus dem 2x2 Grid (Klassische Posten mit gebucht/bezahlt Status)
      let bookedPaidBase = 0;
      let openPlannedBase = 0;

      document.querySelectorAll('.budget-category-card').forEach(card => {
        let catTotal = 0;
        card.querySelectorAll('.sub-price-item').forEach(sub => {
          const val = (parseFloat(sub.getAttribute('data-eur')) || 0) * multiplier;
          catTotal += val;
          const isPaid = sub.getAttribute('data-paid') === 'true';
          if (isPaid) {
            bookedPaidBase += val;
          } else {
            openPlannedBase += val;
          }
          const span = sub.querySelector('.sub-price-val');
          if (span && sub.id !== 'budget-fuel-item') {
            span.innerText = `${val.toFixed(0)} €`;
          }
        });
        const totalDisp = card.querySelector('.card-total-price');
        if (totalDisp) totalDisp.innerText = `${catTotal.toFixed(0)} €`;
      });

      // 3. Vor-Ort-Budget (Taschengeld für Essen, Drinks, Supermarkt & Spesen)
      const onsiteSpendAmount = getOnsiteSpendAmount() * currentMemoryDays().length * multiplier;

      // 4. Ausgaben aus dem Ausgaben-Tracker (bereits getätigte Vor-Ort Ausgaben)
      // Standard-Startflüge (exp-1 bis exp-4) nicht doppelt zählen, da sie bereits im 2x2 Grid als bezahlt geführt werden!
      let trackerOnsiteSpent = 0;
      userExpenses.forEach(exp => {
        if (exp.category === 'flights') return; // Flüge sind bereits im 2x2 Grid als gebucht/bezahlt erfasst
        const pCount = exp.persons || 4;
        if (isPerPerson) {
          trackerOnsiteSpent += (exp.amountEur / pCount);
        } else {
          trackerOnsiteSpent += exp.amountEur;
        }
      });

      // 5. ZENTRALE KONSISTENTE BERECHNUNG:
      // Geplante Basiskosten (Fixe Etappen): z.B. 2.608 € p.P.
      const plannedCostsBase = bookedPaidBase + openPlannedBase;

      // Geplantes Gesamtbudget = Alle geplanten Kosten + Vor-Ort-Budget: z.B. 3.408 € p.P.
      const totalPlannedBudget = plannedCostsBase + onsiteSpendAmount;

      // Bereits gebucht & bezahlt = Vorab bezahlte Fixposten + bisher getätigte Vor-Ort-Ausgaben
      const actualBookedAndSpent = bookedPaidBase + trackerOnsiteSpent;

      // Verbleibendes Budget = Gesamtbudget − Bisher gebucht/bezahlt
      const remainingBudget = Math.max(0, totalPlannedBudget - actualBookedAndSpent);

      // Verbleibendes Vor-Ort-Budget = Onsite Budget − bisherige Vor-Ort Ausgaben
      const remainingOnsite = Math.max(0, onsiteSpendAmount - trackerOnsiteSpent);

      // Durchschnitte
      const dailyAveragePlanned = Math.round(totalPlannedBudget / 20);
      const dailyRemaining = Math.round(remainingBudget / 20);

      // 6. DOM-Aktualisierung der KPI-Karten
      const kpiTotal = document.getElementById('kpi-total-budget');
      if (kpiTotal) kpiTotal.innerText = `${Math.round(totalPlannedBudget).toLocaleString('de-DE')} €`;
      const kpiTotalSub = document.getElementById('kpi-total-sub');
      if (kpiTotalSub) kpiTotalSub.innerText = isPerPerson ? 'pro Person (4 Pers. x4)' : 'für alle 4 Personen';

      const kpiPlanned = document.getElementById('kpi-planned-cost');
      if (kpiPlanned) kpiPlanned.innerText = `${Math.round(plannedCostsBase).toLocaleString('de-DE')} €`;
      const kpiPlannedSub = document.getElementById('kpi-planned-sub');
      if (kpiPlannedSub) kpiPlannedSub.innerText = `Fixkosten (${Math.round(bookedPaidBase)} € gebucht)`;

      const kpiActual = document.getElementById('kpi-actual-spent');
      if (kpiActual) kpiActual.innerText = `${Math.round(actualBookedAndSpent).toLocaleString('de-DE')} €`;
      const kpiActualSub = document.getElementById('kpi-actual-sub');
      if (kpiActualSub) kpiActualSub.innerText = `Bereits gebucht & bezahlt`;

      const kpiRem = document.getElementById('kpi-remaining-budget');
      if (kpiRem) kpiRem.innerText = `${Math.round(remainingBudget).toLocaleString('de-DE')} €`;
      const kpiRemSub = document.getElementById('kpi-remaining-sub');
      if (kpiRemSub) kpiRemSub.innerText = `Noch verfügbar (${Math.round(remainingOnsite)} € Taschengeld)`;

      const kpiDailyAvg = document.getElementById('kpi-daily-avg');
      if (kpiDailyAvg) kpiDailyAvg.innerText = `${dailyAveragePlanned} € / Tag`;

      const kpiDailyRem = document.getElementById('kpi-daily-remaining');
      if (kpiDailyRem) kpiDailyRem.innerText = `${dailyRemaining} € / Tag`;

      // Header Gesamt-Badges
      const totalBadge = document.getElementById('total-sum-badge');
      if (totalBadge) totalBadge.innerText = `Gesamt: ${Math.round(totalPlannedBudget).toLocaleString('de-DE')} €`;
      const paidEl = document.getElementById('paid-amount');
      if (paidEl) paidEl.innerText = `${Math.round(actualBookedAndSpent).toLocaleString('de-DE')} €`;
      const openEl = document.getElementById('open-amount');
      if (openEl) openEl.innerText = `${Math.round(remainingBudget).toLocaleString('de-DE')} €`;

      const pct = totalPlannedBudget > 0 ? Math.min(100, Math.round((actualBookedAndSpent / totalPlannedBudget) * 100)) : 0;
      const progPaid = document.getElementById('progress-paid');
      if (progPaid) progPaid.style.width = pct + '%';
      const progOpen = document.getElementById('progress-open');
      if (progOpen) progOpen.style.width = (100 - pct) + '%';

      renderCurrentBudgetChart();
      if (typeof updateOnsiteSpendMetrics === 'function') updateOnsiteSpendMetrics();
    }

    function applyCheckboxStatesToUI() {
      document.querySelectorAll('.sync-checkbox').forEach(cb => {
        if (cb.id) cb.checked = !!checkboxStates[cb.id];
      });
    }

    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('sync-checkbox') && e.target.id) {
        checkboxStates[e.target.id] = e.target.checked;
        broadcastState();
      }
    });

    // =========================================================================
    // INTERAKTIVE ROUTEN- & SIGHTSEEING-KARTE (LEAFLET & RESIZEOBSERVER)
    // =========================================================================
    const ALL_SIGHTSEEING_SPOTS = [
      {
        "day": 2,
        "name": "Darling Harbour & Barangaroo Promenade",
        "category": "Promenade & Skyline",
        "mapsUrl": "https://maps.google.com/?q=Darling%2BHarbour%2BBarangaroo%2BSydney",
        "highlight": "Flaniermeile & nächtliche Skyline mit erstklassigen Restaurants direkt am Wasser.",
        "photoTip": "Entlang der Barangaroo Promenade mit Weitwinkel auf das beleuchtete Hafenbecken und die spiegelnden Skyline-Lichter. <span style=\"font-weight:700; color:var(--primary); font-size:0.78rem;\">(🌃 Blue Hour / Abends)</span>",
        "id": 1,
        "region": "sydney",
        "coords": [
          -33.8695,
          151.201
        ]
      },
      {
        "day": 3,
        "name": "Sydney Opera House & Mrs Macquarie’s Chair",
        "category": "Oper & Postkartenblick",
        "mapsUrl": "https://maps.google.com/?q=Mrs%2BMacquaries%2BChair%2BSydney",
        "highlight": "Weltberühmter Postkartenblick auf Oper und Harbour Bridge im warmen Abendlicht.",
        "photoTip": "Von den Steinstufen am Mrs Macquarie’s Chair – nur hier hat man das Opernhaus und die Harbour Bridge perfekt versetzt in einer gemeinsamen Flucht. <span style=\"font-weight:700; color:var(--primary); font-size:0.78rem;\">(🌅 Später Nachmittag / Golden Hour)</span>",
        "id": 2,
        "region": "sydney",
        "coords": [
          -33.8585,
          151.2185
        ]
      },
      {
        "day": 3,
        "name": "The Rocks & Harbour Bridge Pylon Walk",
        "category": "Historisches Viertel & Brücke",
        "mapsUrl": "https://maps.google.com/?q=The%2BRocks%2BSydney",
        "highlight": "Historisches Sandsteinviertel mit Kopfsteinpflaster, Pubs & Fußgängeraufgang auf die Brücke.",
        "photoTip": "Vom Pylon Lookout oder den Cumberland Street Treppen – fängt die massiven genieteten Stahlbögen von schräg unten ein. <span style=\"font-weight:700; color:var(--primary); font-size:0.78rem;\">(☀️ Vormittags (Klarer Himmel))</span>",
        "id": 3,
        "region": "sydney",
        "coords": [
          -33.859,
          151.2085
        ]
      },
      {
        "day": 4,
        "name": "Bondi Beach & Icebergs Pool",
        "category": "Küstenwanderung & Ozeanpool",
        "mapsUrl": "https://maps.google.com/?q=Bondi%2Bto%2BCoogee%2BWalk%2BSydney",
        "highlight": "6 km spektakulärer Klippenpfad am Pazifik vorbei an Tamarama, Bronte und dem Icebergs Pool.",
        "photoTip": "Vom Klippenpfad direkt oberhalb des Bondi Icebergs Club – erhöhter Blickwinkel hinab auf die weißen Wellen, die in den Pool schwappen. <span style=\"font-weight:700; color:var(--primary); font-size:0.78rem;\">(☀️ Vormittag (Klares Licht))</span>",
        "id": 4,
        "region": "sydney",
        "coords": [
          -33.8915,
          151.2767
        ]
      },
      {
        "day": 4,
        "name": "Surry Hills & Paddington (Crown St)",
        "category": "Cafékultur & Boutiquen",
        "mapsUrl": "https://maps.google.com/?q=Crown%2BStreet%2BSurry%2BHills%2BSydney",
        "highlight": "Trendiges Szeneviertel mit viktorianischen Reihenhäusern, Vintage-Boutiquen und Cafés.",
        "photoTip": "Kreuzungsbereich Crown St & Campbell St vor den viktorianischen Gusseisen-Balkonen und Specialty-Cafés. <span style=\"font-weight:700; color:var(--primary); font-size:0.78rem;\">(☕ Nachmittags (Street Life))</span>",
        "id": 5,
        "region": "sydney",
        "coords": [
          -33.886,
          151.2135
        ]
      },
      {
        "day": 5,
        "name": "Cape Byron Lighthouse",
        "category": "Östlichster Punkt Australiens",
        "mapsUrl": "https://maps.google.com/?q=Cape%2BByron%2BLighthouse",
        "highlight": "Östlichster Punkt des australischen Festlands mit 360°-Ozeanblick und häufigen Delfinsichtungen.",
        "photoTip": "Auf dem Holzsteg-Pfad ca. 100 m unterhalb des Leuchtturms mit Blick nach oben – fängt den Turm samt Klippenkante ein. <span style=\"font-weight:700; color:var(--primary); font-size:0.78rem;\">(🌅 Sonnenuntergang / Dämmerung)</span>",
        "id": 6,
        "region": "byron",
        "coords": [
          -28.6384,
          153.6366
        ]
      },
      {
        "day": 6,
        "name": "Wategos Beach & The Pass",
        "category": "Traumstrand & Surfspots",
        "mapsUrl": "https://maps.google.com/?q=Wategos%2BBeach%2BByron%2BBay",
        "highlight": "Berühmter Surf-Break für Longboards, türkisblaues Wasser und Meeresschildkröten.",
        "photoTip": "Vom erhöhten Holz-Aussichtsturm direkt über dem Pass – fantastischer Überblick über Surfer auf den endlosen Wellen. <span style=\"font-weight:700; color:var(--primary); font-size:0.78rem;\">(🏄‍♂️ Vormittag / Glattes Wasser)</span>",
        "id": 7,
        "region": "byron",
        "coords": [
          -28.636,
          153.628
        ]
      },
      {
        "day": 7,
        "name": "Burleigh Heads Lookout",
        "category": "Surferparadies & Aussicht",
        "mapsUrl": "https://maps.google.com/?q=Burleigh%2BHeads%2BLookout",
        "highlight": "Spektakulärer Surfer-Point & Panoramablick auf die Hochhaus-Skyline von Surfers Paradise.",
        "photoTip": "Tumgun Lookout im Burleigh Head Nationalpark – Rahmung der Skyline durch die australischen Pinienbäume. <span style=\"font-weight:700; color:var(--primary); font-size:0.78rem;\">(🌤️ Mittags bis Nachmittag)</span>",
        "id": 8,
        "region": "byron",
        "coords": [
          -28.0933,
          153.456
        ]
      },
      {
        "day": 7,
        "name": "Howard Smith Wharves & Story Bridge",
        "category": "Kulinarik & Brückenblick",
        "mapsUrl": "https://maps.google.com/?q=Howard%2BSmith%2BWharves%2BBrisbane",
        "highlight": "Brauereien, Bars & erstklassige Lokale direkt unter den Bögen der beleuchteten Story Bridge.",
        "photoTip": "Direkt an der Uferkante der Wharves vor Felons Brewing – Weitwinkel von unten schräg gegen das Brückengerüst. <span style=\"font-weight:700; color:var(--primary); font-size:0.78rem;\">(🌃 Blue Hour / Abends)</span>",
        "id": 9,
        "region": "brisbane",
        "coords": [
          -27.4608,
          153.036
        ]
      },
      {
        "day": 8,
        "name": "South Bank Parklands & Streets Beach",
        "category": "Künstliche Lagune & Stadtstrand",
        "mapsUrl": "https://maps.google.com/?q=Streets%2BBeach%2BSouth%2BBank%2BBrisbane",
        "highlight": "Australiens einziger künstlicher Stadtstrand mitten im Zentrum mit tropischen Gärten.",
        "photoTip": "Von den Holzliegen an Streets Beach mit den Palmen im Vordergrund und den Wolkenkratzern im Hintergrund. <span style=\"font-weight:700; color:var(--primary); font-size:0.78rem;\">(🌴 Nachmittag / Sonnenschein)</span>",
        "id": 10,
        "region": "brisbane",
        "coords": [
          -27.4785,
          153.0205
        ]
      },
      {
        "day": 8,
        "name": "Mt Coot-tha Summit Lookout",
        "category": "Panoramablick über Brisbane",
        "mapsUrl": "https://maps.google.com/?q=Mount%2BCoot-tha%2BLookout%2BBrisbane",
        "highlight": "Höchster Panoramablick über die Millionenstadt Brisbane bis hin zur Moreton Bay.",
        "photoTip": "An der vorderen steinernen Aussichtsplattform mit Blick genau nach Osten über das gesamte Tal von Brisbane. <span style=\"font-weight:700; color:var(--primary); font-size:0.78rem;\">(🌇 Sonnenuntergang)</span>",
        "id": 11,
        "region": "brisbane",
        "coords": [
          -27.477,
          152.9535
        ]
      },
      {
        "day": 9,
        "name": "Australia Zoo (Home of the Crocodile Hunter)",
        "category": "Wildlife & Krokodil-Shows",
        "mapsUrl": "https://maps.google.com/?q=Australia%2BZoo%2BBeerwah",
        "highlight": "Steve Irwins weltberühmter Zoo mit riesigen Freigehegen für Koalas, Kängurus und Krokodile.",
        "photoTip": "In den offenen Roo-Heaven Freigehegen auf Augenhöhe mit den Kängurus und im Crocoseum. <span style=\"font-weight:700; color:var(--primary); font-size:0.78rem;\">(🦘 Vormittags (Fütterungszeit))</span>",
        "id": 12,
        "region": "brisbane",
        "coords": [
          -26.837,
          152.961
        ]
      },
      {
        "day": 10,
        "name": "Mt Ngungun (Glass House Mountains)",
        "category": "Vulkanberge & Panoramagipfel",
        "mapsUrl": "https://maps.google.com/?q=Mount%2BNgungun%2BTrack",
        "highlight": "360°-Gipfelblick auf die Vulkankegel der Glass House Mountains nach ca. 40 Min. Aufstieg.",
        "photoTip": "Vom felsigen Gipfelplateau mit Blick auf den markanten Mt Tibrogargan und Mt Coonowrin. <span style=\"font-weight:700; color:var(--primary); font-size:0.78rem;\">(🌄 Vormittag / Weitsicht)</span>",
        "id": 13,
        "region": "brisbane",
        "coords": [
          -26.9015,
          152.935
        ]
      },
      {
        "day": 10,
        "name": "Fairy Pools / Noosa National Park",
        "category": "Natur-Gezeitenpools & Küstenpfad",
        "mapsUrl": "https://maps.google.com/?q=Noosa%2BNational%2BPark",
        "highlight": "Malerischer Küstenpfad, Natur-Felsenpools und einer der besten Spots für wilde Koalas.",
        "photoTip": "Direkt auf den Basaltfelsen oberhalb des Beckens senkrecht hinab auf das türkisfarbene Wasser. <span style=\"font-weight:700; color:var(--primary); font-size:0.78rem;\">(🌊 Nur bei Low Tide (Niedrigwasser))</span>",
        "id": 14,
        "region": "brisbane",
        "coords": [
          -26.381,
          153.111
        ]
      },
      {
        "day": 11,
        "name": "Carlo Sand Blow",
        "category": "Riesensanddüne & Pazifikblick",
        "mapsUrl": "https://maps.google.com/?q=Carlo%2BSand%2BBlow%2BRainbow%2BBeach",
        "highlight": "Riesige 15 Hektar große Sanddüne direkt über dem Meer mit Blick auf Double Island Point.",
        "photoTip": "Oberer Scheitelkamm der Düne mit Blick nach Westen über den Great Sandy Strait für dramatische Schattenwürfe im Sand. <span style=\"font-weight:700; color:var(--primary); font-size:0.78rem;\">(🌇 Golden Hour)</span>",
        "id": 15,
        "region": "islands",
        "coords": [
          -25.908,
          153.0964
        ]
      },
      {
        "day": 12,
        "name": "Lake McKenzie & Maheno Wreck (K’gari)",
        "category": "Süßwassersee & Sandinsel",
        "mapsUrl": "https://maps.google.com/?q=Lake%2BMcKenzie%2BFraser%2BIsland",
        "highlight": "Schneeweißer Quarzsand, glasklarer Süßwassersee und historisches Schiffswrack am 75 Mile Beach.",
        "photoTip": "30 Meter schräg vor dem Bug am Strand – die Brandung umspült die Wrackrippen für tolle Kontrastaufnahmen. <span style=\"font-weight:700; color:var(--primary); font-size:0.78rem;\">(☀️ Tagsüber)</span>",
        "id": 16,
        "region": "islands",
        "coords": [
          -25.449,
          153.058
        ]
      },
      {
        "day": 13,
        "name": "Airlie Beach Esplanade & Coral Sea Marina",
        "category": "Tropische Lagune & Yachthafen",
        "mapsUrl": "https://maps.google.com/?q=Coral%2BSea%2BMarina%2BAirlie%2BBeach",
        "highlight": "Tropisches Tor zu den Whitsunday-Inseln mit Palmenpromenade und Marina-Atmosphäre.",
        "photoTip": "Aus dem Helikopter-Fenster mit Blick senkrecht hinab auf das herzförmige Heart Reef im Korallenmeer. <span style=\"font-weight:700; color:var(--primary); font-size:0.78rem;\">(🚁 Nachmittag (Helikopterflug))</span>",
        "id": 17,
        "region": "islands",
        "coords": [
          -20.2675,
          148.718
        ]
      },
      {
        "day": 14,
        "name": "Hill Inlet Lookout & Whitehaven Beach",
        "category": "Silikatsand & Türkis-Wirbel",
        "mapsUrl": "https://maps.google.com/?q=Hill%2BInlet%2BLookout%2BWhitsundays",
        "highlight": "Wirbelnde weiße Sandbänke bei Ebbe und der feinste Quarzsandstrand der Erde.",
        "photoTip": "Mittlere Aussichtsplattform des Hill Inlet Lookout – der klassische Panoramablick auf die Sandmuster. <span style=\"font-weight:700; color:var(--primary); font-size:0.78rem;\">(🌤️ Ebbe / Ablaufendes Wasser)</span>",
        "id": 18,
        "region": "islands",
        "coords": [
          -20.285,
          149.038
        ]
      },
      {
        "day": 15,
        "name": "Cedar Creek Falls & Conway Nationalpark",
        "category": "Tropischer Wasserfall & Naturpool",
        "mapsUrl": "https://maps.google.com/?q=Cedar%2BCreek%2BFalls%2BQueensland",
        "highlight": "Natürlicher Süßwasser-Wasserfall mit Badelagune mitten im tropischen Regenwald.",
        "photoTip": "Von den glatten Felsblöcken am Rand des Schwimmbeckens mit Blick direkt in den Wasserfallkessel. <span style=\"font-weight:700; color:var(--primary); font-size:0.78rem;\">(🌿 Vormittags (Weiches Waldlicht))</span>",
        "id": 19,
        "region": "islands",
        "coords": [
          -20.407,
          148.694
        ]
      },
      {
        "day": 16,
        "name": "Melbourne Southbank & Yarra River",
        "category": "Kunstareal & Flussufer",
        "mapsUrl": "https://maps.google.com/?q=Southbank%2BPromenade%2BMelbourne",
        "highlight": "Lebendige Uferpromenade mit Wolkenkratzer-Kulisse, Straßenmusik und Kulturzentren.",
        "photoTip": "Evan Walker Bridge oder Princes Bridge mit Blick nach Westen über den spiegelnden Fluss und die erleuchtete Skyline. <span style=\"font-weight:700; color:var(--primary); font-size:0.78rem;\">(🌃 Dämmerung / Beleuchtung)</span>",
        "id": 20,
        "region": "melbourne",
        "coords": [
          -37.8205,
          144.964
        ]
      },
      {
        "day": 17,
        "name": "Hosier Lane & Laneways",
        "category": "Street Art & Kaffeekultur",
        "mapsUrl": "https://maps.google.com/?q=Hosier%2BLane%2BMelbourne",
        "highlight": "Melbournes bekannteste Street-Art-Gassen und das pulsierende Zentrum der Kaffeekultur.",
        "photoTip": "Kreuzungsbereich Hosier Lane / Rutledge Lane – Blickwinkel von weit unten nach oben, um die beidseitige Wandhöhe einzufangen. <span style=\"font-weight:700; color:var(--primary); font-size:0.78rem;\">(☁️ Leicht bewölkt / Diffuses Licht)</span>",
        "id": 21,
        "region": "melbourne",
        "coords": [
          -37.8163,
          144.969
        ]
      },
      {
        "day": 17,
        "name": "St. Kilda Pier (Zwergpinguin-Kolonie)",
        "category": "Zwergpinguin-Kolonie",
        "mapsUrl": "https://maps.google.com/?q=St%2BKilda%2BPier%2BMelbourne",
        "highlight": "Wilde Kolonie von Zwergpinguinen, die abends am Wellenbrecher an Land kommen.",
        "photoTip": "Am Ende des Holzstegs vor dem Kiosk mit Blick auf die Felsbrocken und den Sonnenuntergang über Port Phillip Bay. <span style=\"font-weight:700; color:var(--primary); font-size:0.78rem;\">(🌅 Sonnenuntergang)</span>",
        "id": 22,
        "region": "melbourne",
        "coords": [
          -37.8645,
          144.968
        ]
      },
      {
        "day": 18,
        "name": "Twelve Apostles & Loch Ard Gorge",
        "category": "Kalksteinsäulen & Schiffswrack-Bucht",
        "mapsUrl": "https://maps.google.com/?q=Twelve%2BApostles%2BVictoria",
        "highlight": "Monumentale Kalksteinfelsen im tosenden Ozean und dramatische Klippenschlucht.",
        "photoTip": "Haupt-Viewing-Platform (Boardwalk Ostseite) für den Blick entlang der Felsnadeln gegen das warme Gegenlicht. <span style=\"font-weight:700; color:var(--primary); font-size:0.78rem;\">(🌅 Später Nachmittag bis Sonnenuntergang)</span>",
        "id": 23,
        "region": "melbourne",
        "coords": [
          -38.6655,
          143.104
        ]
      },
      {
        "day": 18,
        "name": "Kennett River (Wilde Koalas)",
        "category": "Wilde Koalas im Eukalyptuswald",
        "mapsUrl": "https://maps.google.com/?q=Kennett%2BRiver%2BKoala%2BWalk",
        "highlight": "Eine der besten Stellen Australiens für wilde Koalas in den Eukalyptusbäumen.",
        "photoTip": "Die ersten 400 Meter der Grey River Road – Blick in die Astgabeln der Manna-Gumbäume. <span style=\"font-weight:700; color:var(--primary); font-size:0.78rem;\">(🐨 Tagsüber)</span>",
        "id": 24,
        "region": "melbourne",
        "coords": [
          -38.673,
          143.864
        ]
      },
      {
        "day": 19,
        "name": "Brighton Bathing Boxes",
        "category": "Bunte historische Strandhäuschen",
        "mapsUrl": "https://maps.google.com/?q=Brighton%2BBathing%2BBoxes",
        "highlight": "82 bunte historische Badehäuschen direkt am Strand mit Skyline-Blick im Hintergrund.",
        "photoTip": "Auf Höhe von Box 1 Fluchtlinie schräg entlang der Kanten mit der fernen Melbourne-Skyline im Hintergrund. <span style=\"font-weight:700; color:var(--primary); font-size:0.78rem;\">(☀️ Vormittags)</span>",
        "id": 25,
        "region": "melbourne",
        "coords": [
          -37.9175,
          144.985
        ]
      },
      {
        "day": 19,
        "name": "Fitzroy (Brunswick & Gertrude Street)",
        "category": "Vintage, Boutiquen & Dachterrassen",
        "mapsUrl": "https://maps.google.com/?q=Brunswick%2BStreet%2BFitzroy%2BMelbourne",
        "highlight": "Kreatives Hipster-Viertel mit Vintage-Stores, Plattenläden und Rooftop-Bars.",
        "photoTip": "Von einer der Rooftop-Terrassen (z. B. Naked for Satan) mit Panoramablick auf die Dächer und die City-Skyline. <span style=\"font-weight:700; color:var(--primary); font-size:0.78rem;\">(🌆 Nachmittags bis Abends)</span>",
        "id": 26,
        "region": "melbourne",
        "coords": [
          -37.7985,
          144.9785
        ]
      },
      {
        "day": 20,
        "name": "Royal Botanic Gardens Victoria",
        "category": "Tropische Oase & Skyline-Blick",
        "mapsUrl": "https://maps.google.com/?q=Royal%2BBotanic%2BGardens%2BVictoria%2BMelbourne",
        "highlight": "Eine der prachtvollsten Parkanlagen der Welt mit 8.500 Pflanzenarten und Ruheoasen.",
        "photoTip": "Am Ufer des Ornamental Lake mit der spiegelnden Trauerweide und den Seerosen. <span style=\"font-weight:700; color:var(--primary); font-size:0.78rem;\">(🌿 Vormittag)</span>",
        "id": 27,
        "region": "melbourne",
        "coords": [
          -37.8304,
          144.98
        ]
      }
    ];

    let activeStageLayer = null;
    let activeStageMarkers = [];
    let activeFocusedDay = null;
    let isSyncingFromMap = false;

    // Phase 4: 4 interaktive Kartenlayer (Reiseziele, Highlights, Unterkünfte, Fotospots)
    let routeLayers = {
      destinations: null,
      highlights: null,
      accommodations: null,
      photospots: null,
    };

    let routeLayerStates = {
      destinations: true,
      highlights: true,
      accommodations: false,
      photospots: false,
    };

    function toggleRouteMapLayer(layerName, isChecked) {
      routeLayerStates[layerName] = isChecked;
      const chk = document.getElementById('layer-chk-' + layerName);
      if (chk && chk.checked !== isChecked) chk.checked = isChecked;

      if (!routeInteractiveMap) {
        ensureRouteMapReady(true);
      }
      if (!routeInteractiveMap || !routeLayers || !routeLayers[layerName]) return;

      if (isChecked) {
        if (!routeInteractiveMap.hasLayer(routeLayers[layerName])) {
          routeInteractiveMap.addLayer(routeLayers[layerName]);
        }
      } else {
        if (routeInteractiveMap.hasLayer(routeLayers[layerName])) {
          routeInteractiveMap.removeLayer(routeLayers[layerName]);
        }
      }
    }
    window.toggleRouteMapLayer = toggleRouteMapLayer;

    // Generiert die 20 interaktiven Tages-Buttons in der Etappen-Pills-Leiste über der Karte
    function renderRouteDaysPills() {
      const bar = document.getElementById('route-days-pills-bar');
      if (!bar) return;
      let html = `
        <span style="font-size:0.74rem; font-weight:700; white-space:nowrap; margin-right:0.25rem">
          <i class="fa-solid fa-calendar-day"></i> Etappe:
        </span>
        <button type="button" class="day-pill-btn ${activeFocusedDay === null ? 'active' : ''}" id="day-pill-all" onclick="focusDayOnMap(null, event)">
          🇦🇺 Alle Etappen
        </button>
      `;
      TRIP_DAYS_DATA.forEach(d => {
        const isActive = activeFocusedDay === d.day;
        html += `
          <button type="button" class="day-pill-btn ${isActive ? 'active' : ''}" id="day-pill-${d.day}" onclick="focusDayOnMap(${d.day}, event)">
            Tag ${d.day}
          </button>
        `;
      });
      bar.innerHTML = html;
    }

    // Zentriert die Karte auf den Tag, blendet Etappe & Start-/Ziel-Marker ein und aktualisiert die Infoleiste
    function focusDayOnMap(dayNum, event, shouldScroll = true) {
      if (window.TripPage) { if (event) event.stopPropagation(); window.TripPage.selectDayNumber(dayNum); return; }
      if (event) event.stopPropagation();

      // Wechsel zu Leaflet, falls Google My Maps Tab aktiv war
      switchRouteMapMode('leaflet');

      if (shouldScroll) {
        const mapSec = document.getElementById('map');
        if (mapSec) {
          mapSec.classList.add('revealed');
          mapSec.classList.remove('from-bottom', 'from-top');
          const card = mapSec.querySelector('.route-map-container-card');
          if (card) {
            card.classList.add('revealed');
            card.classList.remove('from-bottom', 'from-top');
          }
          mapSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }

      ensureRouteMapReady(true);

      if (!routeInteractiveMap) {
        setTimeout(() => {
          ensureRouteMapReady(true);
          if (routeInteractiveMap) {
            focusDayOnMap(dayNum, null, false);
          }
        }, 180);
        return;
      }

      // 1. Wenn Tag null: Zurücksetzen auf Gesamtübersicht
      if (!dayNum || dayNum === 'all') {
        activeFocusedDay = null;
        if (activeStageLayer) {
          routeInteractiveMap.removeLayer(activeStageLayer);
          activeStageLayer = null;
        }
        activeStageMarkers.forEach(m => routeInteractiveMap.removeLayer(m));
        activeStageMarkers = [];

        // Pins normalisieren & Dimming aufheben
        routeMapMarkers.forEach(({ marker }) => {
          if (marker._icon) {
            marker._icon.classList.remove('dimmed-marker');
            const bubble = marker._icon.querySelector('.sight-pin-bubble');
            if (bubble) bubble.classList.remove('active-day-pin');
            marker.setZIndexOffset(0);
          }
        });

        // Hintergrundrouten wieder voll sichtbar
        routeMapLines.forEach(line => {
          line.setStyle({ opacity: 0.85, weight: 4 });
        });

        // Stage Info ausblenden
        const stageInfo = document.getElementById('route-map-stage-info');
        if (stageInfo) stageInfo.style.display = 'none';

        // Pills aktualisieren
        document.querySelectorAll('.day-pill-btn').forEach(b => b.classList.remove('active'));
        const allPill = document.getElementById('day-pill-all');
        if (allPill) allPill.classList.add('active');

        // Mobile Bottom Sheet auf Tag 1 zurücksetzen
        if (typeof updateMobileBottomSheet === 'function') {
          updateMobileBottomSheet(1);
        }

        resetRouteMapView();
        setTimeout(() => {
          if (routeInteractiveMap) routeInteractiveMap.invalidateSize({ pan: false });
        }, 250);
        return;
      }

      // 2. Tag-Daten abrufen
      const dayData = TRIP_DAYS_DATA.find(d => d.day === dayNum);
      if (!dayData) return;

      activeFocusedDay = dayNum;

      // Vorherige Etappenelemente entfernen
      if (activeStageLayer) {
        routeInteractiveMap.removeLayer(activeStageLayer);
        activeStageLayer = null;
      }
      activeStageMarkers.forEach(m => routeInteractiveMap.removeLayer(m));
      activeStageMarkers = [];

      // 3. Aktive Routenlinie für die Tagesetappe zeichnen (goldgelb leuchtend)
      if (dayData.stageRoute && dayData.stageRoute.length >= 2) {
        activeStageLayer = L.polyline(dayData.stageRoute, {
          color: '#f59e0b',
          weight: 6,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
          dashArray: dayData.transportType === 'flight' ? '8, 12' : null
        }).addTo(routeInteractiveMap);
      }

      // Hintergrund-Routenlinien zurückhaltender/abgedimmt darstellen
      routeMapLines.forEach(line => {
        line.setStyle({ opacity: 0.22, weight: 2 });
      });

      // 4. Start- und Ziel-Endpunktmarker erzeugen
      if (dayData.startCoords) {
        const startIcon = L.divIcon({
          html: '<div class="stage-endpoint-marker start" title="Startpunkt"><i class="fa-solid fa-flag-checkered"></i></div>',
          className: 'stage-endpoint-wrapper',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });
        const startMarker = L.marker(dayData.startCoords, { icon: startIcon, zIndexOffset: 2500 })
          .addTo(routeInteractiveMap)
          .bindTooltip(`<strong>Start:</strong> ${escapeHtml(dayData.start)}`, { direction: 'top', offset: [0, -14] });
        activeStageMarkers.push(startMarker);
      }

      if (dayData.destCoords) {
        const destIcon = L.divIcon({
          html: '<div class="stage-endpoint-marker dest" title="Zielpunkt"><i class="fa-solid fa-location-dot"></i></div>',
          className: 'stage-endpoint-wrapper',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });
        const destMarker = L.marker(dayData.destCoords, { icon: destIcon, zIndexOffset: 2500 })
          .addTo(routeInteractiveMap)
          .bindTooltip(`<strong>Ziel:</strong> ${escapeHtml(dayData.destination)}`, { direction: 'top', offset: [0, -14] });
        activeStageMarkers.push(destMarker);
      }

      // 5. Sightseeing-Marker dieses Tages hervorheben & andere zurückhaltender (dimmed) darstellen
      const bounds = L.latLngBounds([]);
      if (dayData.startCoords) bounds.extend(dayData.startCoords);
      if (dayData.destCoords) bounds.extend(dayData.destCoords);

      let firstDayMarker = null;

      routeMapMarkers.forEach(({ marker, spot }) => {
        const isThisDay = spot.day === dayNum;
        if (marker._icon) {
          const bubble = marker._icon.querySelector('.sight-pin-bubble');
          if (isThisDay) {
            marker._icon.classList.remove('dimmed-marker');
            if (bubble) bubble.classList.add('active-day-pin');
            marker.setZIndexOffset(3500);
          } else {
            marker._icon.classList.add('dimmed-marker');
            if (bubble) bubble.classList.remove('active-day-pin');
            marker.setZIndexOffset(0);
          }
        }
        if (isThisDay) {
          bounds.extend(spot.coords);
          if (!firstDayMarker) firstDayMarker = marker;
          if (!routeInteractiveMap.hasLayer(marker)) marker.addTo(routeInteractiveMap);
        }
      });

      // 6. Kartenausschnitt anpassen
      if (bounds.isValid()) {
        routeInteractiveMap.fitBounds(bounds, { padding: [55, 55], maxZoom: 13 });
      } else if (dayData.center) {
        routeInteractiveMap.setView(dayData.center, dayData.zoom || 11);
      }

      // Popup des Haupt-Spots öffnen (verzögert für sauberes Layout)
      if (firstDayMarker) {
        setTimeout(() => {
          if (activeFocusedDay === dayNum) firstDayMarker.openPopup();
        }, 160);
      }

      // 7. Tagesetappen-Infoleiste über der Karte befüllen & anzeigen
      const stageInfo = document.getElementById('route-map-stage-info');
      if (stageInfo) {
        stageInfo.innerHTML = `
          <div class="stage-info-header">
            <div class="stage-info-title">
              <span class="timeline-day-badge" style="font-size:0.76rem; padding:0.2rem 0.55rem">Tag ${dayData.day}</span>
              <span>${escapeHtml(dayData.title)}</span>
              <span style="font-size:0.78rem; font-weight:600">(${escapeHtml(dayData.date)})</span>
            </div>
            <button type="button" class="btn-stage-close" onclick="focusDayOnMap(null, event)" title="Etappenfokus aufheben">
              <i class="fa-solid fa-xmark"></i> Alle Etappen
            </button>
          </div>

          <div class="stage-info-route-row">
            <span>🏁 <strong>Start:</strong> ${escapeHtml(dayData.start)}</span>
            <span class="stage-info-route-arrow">➔</span>
            <span>📍 <strong>Ziel:</strong> ${escapeHtml(dayData.destination)}</span>
          </div>

          <div class="stage-info-badges">
            <span class="stage-badge distance"><i class="fa-solid fa-route"></i> Distanz: ${escapeHtml(dayData.distance)}</span>
            <span class="stage-badge drive-time"><i class="fa-solid fa-clock"></i> Fahrzeit: ${escapeHtml(dayData.driveTime)}</span>
            <span class="stage-badge hotel"><i class="fa-solid fa-bed"></i> Unterkunft: ${escapeHtml(dayData.accommodation)}</span>
          </div>

          <div class="stage-info-actions">
            <button type="button" class="btn-stage-jump" onclick="jumpToDayAndHighlight(${dayData.day})">
              <i class="fa-solid fa-calendar-day"></i> Im Reiseplan Tag ${dayData.day} öffnen &amp; Details ansehen
            </button>
          </div>
        `;
        stageInfo.style.display = 'flex';
      }

      // 8. Pills-Bar aktualisieren
      document.querySelectorAll('.day-pill-btn').forEach(b => b.classList.remove('active'));
      const activePill = document.getElementById('day-pill-' + dayNum);
      if (activePill) {
        activePill.classList.add('active');
        activePill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }

      // 9. Mobile Bottom Sheet aktualisieren
      if (typeof updateMobileBottomSheet === 'function') {
        updateMobileBottomSheet(dayNum);
      }

      // 9b. Zielarchitektur: Floating Day Plan Overlay & Days Bar aktualisieren
      if (typeof renderDayPlanOverlay === 'function') {
        renderDayPlanOverlay(dayNum);
      }
      if (typeof renderFloatingDaysBar === 'function') {
        renderFloatingDaysBar(dayNum);
      }

      // 10. Sanft zur Karte scrollen, falls gewünscht
      if (shouldScroll) {
        const mapSection = document.getElementById('map') || document.querySelector('.route-map-container-card');
        if (mapSection) {
          mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }

      routeInteractiveMap.invalidateSize({ pan: false });
    }

    // Zentriert die Karte direkt auf einen spezifischen Spot und öffnet sein Popup
    function focusSpotOnMap(spotId, event) {
      if (event) event.stopPropagation();

      const spot = ALL_SIGHTSEEING_SPOTS.find(s => s.id === spotId);
      if (!spot) return;

      focusDayOnMap(spot.day, event, true);

      setTimeout(() => {
        if (!routeInteractiveMap) return;
        routeInteractiveMap.setView(spot.coords, 14);
        const markerObj = routeMapMarkers.find(m => m.spot.id === spotId);
        if (markerObj) markerObj.marker.openPopup();
      }, 200);
    }

    // Von der Karte zum Reiseplan: Öffnet den passenden Tag, scrollt dorthin und hebt Tag + Spot hervor
    function jumpToDayAndHighlight(dayNum, spotId) {
      if (window.TripPage) {
        showView('reise');
        window.TripPage.selectDayNumber(dayNum);
        const dayEl = document.getElementById('day-' + dayNum) || document.getElementById('trip-day-' + dayNum);
        if (dayEl) dayEl.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      isSyncingFromMap = true;
      if (typeof showView === 'function') {
        showView('reise', true);
      }
      if (window.innerWidth <= 960 && typeof switchMobileReiseMode === 'function') {
        switchMobileReiseMode('plan');
      }

      const dayEl = document.getElementById('day-' + dayNum);
      if (!dayEl) {
        isSyncingFromMap = false;
        return;
      }

      // Reiseplan-Bereich sichtbar machen
      const routeSec = document.getElementById('route');
      if (routeSec) {
        routeSec.classList.add('revealed');
        routeSec.classList.remove('from-bottom', 'from-top');
      }
      dayEl.classList.add('revealed');
      dayEl.classList.remove('from-bottom', 'from-top');

      // Accordion aufklappen
      dayEl.open = true;
      const dayPlan = dayEl.querySelector('.day-plan-accordion');
      if (dayPlan) dayPlan.open = true;

      // Leuchteffekt für den Tag
      dayEl.classList.add('highlight-glow');
      setTimeout(() => dayEl.classList.remove('highlight-glow'), 2600);

      // Zielarchitektur: Floating Day Plan Overlay öffnen & anzeigen
      if (typeof openDayOverlay === 'function') {
        openDayOverlay();
      }
      if (typeof renderDayPlanOverlay === 'function') {
        renderDayPlanOverlay(dayNum);
      }
      if (typeof renderFloatingDaysBar === 'function') {
        renderFloatingDaysBar(dayNum);
      }

      if (spotId) {
        const spotCard = document.getElementById('spot-card-' + spotId) || dayEl.querySelector(`[data-spot-id="${spotId}"]`);
        if (spotCard) {
          spotCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          spotCard.classList.add('spot-highlight-pulse');
          setTimeout(() => {
            spotCard.classList.remove('spot-highlight-pulse');
            isSyncingFromMap = false;
          }, 2800);
          return;
        }
      }

      dayEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        isSyncingFromMap = false;
      }, 1500);
    }

    // Synchronisation beim manuellen Aufklappen der Tage im Reiseplan (ohne Ruckeln)
    function setupTimelineMapSync() {
      document.querySelectorAll('details.timeline-item').forEach(detailsEl => {
        detailsEl.addEventListener('toggle', () => {
          if (detailsEl.open && !isSyncingFromMap) {
            const dayNum = parseInt(detailsEl.id.replace('day-', ''), 10);
            if (dayNum) {
              focusDayOnMap(dayNum, null, false);
            }
          }
        });
      });
    }

    let routeInteractiveMap = null;
    let routeMapInitializing = false;
    let routeMapMarkers = [];
    let routeMapLines = [];
    let routeMapResizeObserver = null;
    let routeMapIntersectionObserver = null;

    // Prüft strikt, ob der Leaflet-Container tatsächlich sichtbar, gerendert und layoutet ist
    function isRouteMapReadyForInit(force = false) {
      const container = document.getElementById('route-interactive-map');
      if (!container || !container.isConnected) return false;

      // 1. Wenn die App noch durch das Sicherheits-PIN Gate gesperrt ist, NICHT initialisieren
      if (document.body.classList.contains('is-locked')) return false;

      // 2. Prüfen, ob der Leaflet-Tab aktiv ist (nicht der Google My Maps Iframe Tab)
      const viewLeaflet = document.getElementById('view-leaflet-map');
      if (viewLeaflet && window.getComputedStyle(viewLeaflet).display === 'none') {
        return false;
      }

      if (force) {
        if (typeof L === 'undefined') return false;
        return true;
      }

      // 3. Prüfen, ob die übergeordnete Karte/Card sichtbar ist
      const card = container.closest('.route-map-container-card') || container.parentElement;
      if (card) {
        const cardStyle = window.getComputedStyle(card);
        if (cardStyle.display === 'none' || cardStyle.visibility === 'hidden') return false;
        // WICHTIG: Falls die Card noch die scroll-tab Klasse ohne revealed hat (opacity ~ 0), warten!
        if (parseFloat(cardStyle.opacity) < 0.1) return false;
      }

      // 4. Prüfen, ob der Container selbst gerendert und sichtbar ist
      const cStyle = window.getComputedStyle(container);
      if (cStyle.display === 'none' || cStyle.visibility === 'hidden') return false;

      const rect = container.getBoundingClientRect();
      const width = rect.width || container.offsetWidth;
      const height = rect.height || container.offsetHeight;

      if (width <= 0 || height <= 0) return false;

      // 5. Leaflet-Bibliothek muss geladen sein
      if (typeof L === 'undefined') return false;

      return true;
    }

    // Robuste Kontrollfunktion: Initialisiert erst bei Sichtbarkeit, ansonsten invalidateSize()
    function ensureRouteMapReady(force = false) {
      if (window.TripPage) return;
      const container = document.getElementById('route-interactive-map');
      if (!container) return;

      if (!isRouteMapReadyForInit(force)) {
        return;
      }

      if (!routeInteractiveMap && !routeMapInitializing) {
        initRouteLeafletMap();
      } else if (routeInteractiveMap) {
        routeInteractiveMap.invalidateSize({ pan: false });
      }
    }

    function setupRouteMapObserver() {
      const container = document.getElementById('route-interactive-map');
      const card = document.querySelector('.route-map-container-card');
      if (!container) return;

      // 1. ResizeObserver: Überwacht Container- und Card-Größenänderungen
      if (typeof ResizeObserver !== 'undefined') {
        if (routeMapResizeObserver) {
          try { routeMapResizeObserver.disconnect(); } catch (e) { }
        }
        routeMapResizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const { width, height } = entry.contentRect;
            if (width > 0 && height > 0) {
              ensureRouteMapReady();
            }
          }
        });
        routeMapResizeObserver.observe(container);
        if (card) routeMapResizeObserver.observe(card);
      }

      // 2. IntersectionObserver: Erkennt Scrollen zur Karte und Zurückscrollen
      if (typeof IntersectionObserver !== 'undefined') {
        if (routeMapIntersectionObserver) {
          try { routeMapIntersectionObserver.disconnect(); } catch (e) { }
        }
        routeMapIntersectionObserver = new IntersectionObserver((entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              if (card && !card.classList.contains('revealed')) {
                card.classList.add('revealed');
              }
              ensureRouteMapReady();
            }
          }
        }, {
          root: null,
          rootMargin: '120px 0px 120px 0px',
          threshold: [0, 0.1, 0.5, 1.0]
        });
        if (card) routeMapIntersectionObserver.observe(card);
        routeMapIntersectionObserver.observe(container);
      }

      // 3. Card transitionend: Ausführen von invalidateSize(), sobald der Opacity-Übergang beendet ist
      if (card) {
        card.addEventListener('transitionend', (e) => {
          if (e.target === card) {
            ensureRouteMapReady();
          }
        });
      }

      // 4. Window Resize & Orientation Change (Smartphone- und Desktop-Breite)
      let resizeTimer = null;
      const handleWindowResize = () => {
        if (routeInteractiveMap) {
          routeInteractiveMap.invalidateSize({ pan: false });
        } else {
          ensureRouteMapReady();
        }
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (routeInteractiveMap) {
            routeInteractiveMap.invalidateSize({ pan: false });
          }
        }, 120);
      };

      window.addEventListener('resize', handleWindowResize, { passive: true });
      window.addEventListener('orientationchange', handleWindowResize, { passive: true });
    }

    function initRouteLeafletMap() {
      const container = document.getElementById('route-interactive-map');
      if (!container) return;

      // 1. Verhindere Mehrfachinitialisierung
      if (routeInteractiveMap || routeMapInitializing) {
        if (routeInteractiveMap) {
          routeInteractiveMap.invalidateSize({ pan: false });
        }
        return;
      }

      // 2. Strikte Sichtbarkeits- und Layoutprüfung
      if (!isRouteMapReadyForInit()) {
        return;
      }

      container.innerHTML = '';
      routeMapInitializing = true;

      try {
        routeInteractiveMap = L.map('route-interactive-map', {
          center: [-28.5, 149.0],
          zoom: 5,
          minZoom: 3,
          maxZoom: 18,
          scrollWheelZoom: false,
          zoomSnap: 0.5,
          wheelPxPerZoomLevel: 120
        });

        // OpenStreetMap Tile-Layer mit Subdomains & CORS
        const routeTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors | Australien Roadtrip 2027',
          maxZoom: 18,
          subdomains: ['a', 'b', 'c'],
          crossOrigin: true
        });
        routeTileLayer.on('tileerror', () => {
          // Graceful handling when offline without console error clutter
        });
        routeTileLayer.addTo(routeInteractiveMap);

        // Routenpfade (Roadtrip-Mietwagenstrecke & Inlandsflüge)
        const roadtripRoutes = [
          [
            [-28.6430, 153.6120],
            [-28.1667, 153.5333],
            [-28.0933, 153.4560],
            [-27.9667, 153.4000],
            [-27.4698, 153.0251],
            [-26.8370, 152.9610],
            [-26.9015, 152.9350],
            [-26.6500, 153.0667],
            [-26.3980, 153.0930],
            [-25.9080, 153.0964],
            [-25.2986, 152.8535]
          ],
          [
            [-20.2675, 148.7180],
            [-20.4070, 148.6940]
          ],
          [
            [-37.8136, 144.9631],
            [-38.1499, 144.3617],
            [-38.3333, 144.3167],
            [-38.4333, 144.1833],
            [-38.5410, 143.9750],
            [-38.6730, 143.8640],
            [-38.7580, 143.6690],
            [-38.7490, 143.4120],
            [-38.6655, 143.1040],
            [-38.6460, 143.0450]
          ]
        ];

        routeMapLines = [];

        roadtripRoutes.forEach(coords => {
          const line = L.polyline(coords, {
            color: '#0d9488',
            weight: 4,
            opacity: 0.85,
            smoothFactor: 1.5,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(routeInteractiveMap);
          routeMapLines.push(line);
        });

        const flightRoutes = [
          [
            [-33.9461, 151.1772],
            [-28.8340, 153.5620]
          ],
          [
            [-20.4950, 148.5520],
            [-37.6690, 144.8410]
          ]
        ];

        flightRoutes.forEach(coords => {
          const flightLine = L.polyline(coords, {
            color: '#f43f5e',
            weight: 2.5,
            dashArray: '6, 9',
            opacity: 0.8
          }).addTo(routeInteractiveMap);
          routeMapLines.push(flightLine);
        });

        const regionNames = {
          sydney: 'Sydney & NSW',
          byron: 'Byron Bay & Gold Coast',
          brisbane: 'Brisbane & Sunshine Coast',
          islands: 'K’gari & Whitsundays',
          melbourne: 'Melbourne & Ocean Road'
        };

        routeMapMarkers = [];

        // LAYER 1: 🚩 REISEZIELE (Wichtige Etappen- & Knotenpunkte)
        routeLayers.destinations = L.layerGroup();
        const keyDestinations = [
          { name: "Sydney (NSW)", coords: [-33.8688, 151.2093], days: "Tage 1–4", desc: "Hafenmetropole, Opernhaus & Coastal Walks", day: 2 },
          { name: "Ballina & Byron Bay (NSW)", coords: [-28.6430, 153.6120], days: "Tage 5–6", desc: "Surfer-Paradies, Leuchtturm & Delfine", day: 5 },
          { name: "Gold Coast / Surfers Paradise (QLD)", coords: [-28.0024, 153.4310], days: "Tag 7", desc: "Skyline & weltberühmte Surfstrände", day: 7 },
          { name: "Brisbane (QLD)", coords: [-27.4698, 153.0251], days: "Tage 7–10", desc: "Sonnige Metropole, South Bank & Riverwalk", day: 8 },
          { name: "Sunshine Coast & Noosa (QLD)", coords: [-26.3980, 153.0930], days: "Tage 10–11", desc: "Nationalpark, Fairy Pools & Kängurus", day: 10 },
          { name: "Hervey Bay & Rainbow Beach (QLD)", coords: [-25.2986, 152.8535], days: "Tag 11", desc: "Carlo Sand Blow & Tor nach K'gari", day: 11 },
          { name: "K'gari / Fraser Island (QLD)", coords: [-25.4490, 153.0580], days: "Tag 12", desc: "Größte Sandinsel der Welt, Lake McKenzie & Maheno", day: 12 },
          { name: "Airlie Beach & Whitsundays (QLD)", coords: [-20.2675, 148.7180], days: "Tage 13–15", desc: "Whitehaven Beach, Great Barrier Reef & Inseln", day: 14 },
          { name: "Melbourne (VIC)", coords: [-37.8136, 144.9631], days: "Tage 16–20", desc: "Kultur- & Kaffee-Hauptstadt, Laneways & Street Art", day: 16 },
          { name: "Great Ocean Road (Port Campbell)", coords: [-38.6180, 142.9960], days: "Tage 18–19", desc: "Twelve Apostles, Loch Ard Gorge & wilde Koalas", day: 18 }
        ];

        keyDestinations.forEach(dest => {
          const destIcon = L.divIcon({
            html: `<div class="dest-pin-bubble" title="${escapeHtml(dest.name)}"><i class="fa-solid fa-flag-checkered"></i></div>`,
            className: 'custom-dest-pin',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
          });
          const destPopup = `
            <div class="sight-map-popup">
              <div class="popup-top-badge">
                <span class="popup-day-tag"><i class="fa-solid fa-map-location-dot"></i> Reiseziel</span>
                <span class="popup-region-tag">${dest.days}</span>
              </div>
              <h4 class="popup-title">${escapeHtml(dest.name)}</h4>
              <div class="popup-highlight">${escapeHtml(dest.desc)}</div>
              <div class="popup-action-row">
                <button type="button" class="btn-popup-jump" onclick="jumpToDayAndHighlight(${dest.day})">
                  <i class="fa-solid fa-calendar-day"></i> Zum Tagesplan
                </button>
              </div>
            </div>
          `;
          L.marker(dest.coords, { icon: destIcon }).bindPopup(destPopup, { maxWidth: 300 }).addTo(routeLayers.destinations);
        });

        // LAYER 2: ⭐ HIGHLIGHTS (Die 27 Sightseeing-Highlights)
        routeLayers.highlights = L.layerGroup();
        ALL_SIGHTSEEING_SPOTS.forEach(spot => {
          const pinHtml = `
            <div class="sight-pin-wrapper" title="${spot.id}. ${escapeHtml(spot.name)}">
              <div class="sight-pin-bubble pin-${spot.region}">
                <span class="sight-pin-inner">${spot.id}</span>
              </div>
            </div>
          `;

          const customIcon = L.divIcon({
            html: pinHtml,
            className: 'custom-route-pin',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -32]
          });

          const catBadge = spot.category ? `<span class="popup-cat-badge">${escapeHtml(spot.category)}</span>` : '';
          const photoTipHtml = spot.photoTip ? `
            <div class="popup-photo-tip">
              <i class="fa-solid fa-camera"></i>
              <div>${spot.photoTip}</div>
            </div>` : '';

          const popupHtml = `
            <div class="sight-map-popup">
              <div class="popup-top-badge">
                <span class="popup-day-tag"><i class="fa-solid fa-calendar-day"></i> Tag ${spot.day}</span>
                <span class="popup-region-tag">${regionNames[spot.region] || spot.region}</span>
                ${catBadge}
              </div>
              <h4 class="popup-title">${spot.id}. ${escapeHtml(spot.name)}</h4>
              <div class="popup-highlight">${escapeHtml(spot.highlight)}</div>
              ${photoTipHtml}
              <div class="popup-action-row">
                <button type="button" class="btn-popup-jump" onclick="jumpToDayAndHighlight(${spot.day}, ${spot.id})">
                  <i class="fa-solid fa-calendar-day"></i> Zum Tagesplan
                </button>
                <a href="${spot.mapsUrl}" target="_blank" rel="noopener noreferrer" class="btn-popup-maps">
                  <i class="fa-solid fa-location-arrow"></i> Google Maps
                </a>
              </div>
            </div>
          `;

          const marker = L.marker(spot.coords, { icon: customIcon })
            .bindPopup(popupHtml, { maxWidth: 320 });

          marker.on('click', () => {
            focusDayOnMap(spot.day, null, false);
            const dayEl = document.getElementById('day-' + spot.day);
            if (dayEl) {
              dayEl.open = true;
              const dayPlan = dayEl.querySelector('.day-plan-accordion');
              if (dayPlan) dayPlan.open = true;
              dayEl.classList.add('highlight-glow');
              setTimeout(() => dayEl.classList.remove('highlight-glow'), 2600);
            }
          });

          marker.addTo(routeLayers.highlights);
          routeMapMarkers.push({ marker, spot });
        });

        // LAYER 3: 🏨 UNTERKÜNFTE (20 Hotels & AirBnBs)
        routeLayers.accommodations = L.layerGroup();
        const hotelCoordsMap = {
          2: [-33.8807, 151.2034],
          3: [-33.8807, 151.2034],
          4: [-33.8807, 151.2034],
          5: [-28.8650, 153.5900],
          6: [-28.8650, 153.5900],
          7: [-28.0030, 153.4290],
          8: [-27.4690, 153.0220],
          9: [-26.6530, 153.0650],
          10: [-25.2950, 152.8900],
          11: [-25.5130, 153.1310],
          12: [-25.5130, 153.1310],
          13: [-20.2740, 148.7060],
          14: [-20.2740, 148.7060],
          15: [-20.2740, 148.7060],
          16: [-37.8140, 144.9510],
          17: [-37.8140, 144.9510],
          18: [-38.6140, 142.9850],
          19: [-37.6980, 144.8960]
        };

        Object.entries(hotelCoordsMap).forEach(([dayStr, coords]) => {
          const day = parseInt(dayStr, 10);
          const hotel = ACCOMMODATION_DETAILS[day];
          if (!hotel) return;

          const hotelIcon = L.divIcon({
            html: `<div class="hotel-pin-bubble" title="${escapeHtml(hotel.name)}"><i class="fa-solid fa-bed"></i></div>`,
            className: 'custom-hotel-pin',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
          });

          const bookingBtn = hotel.bookingUrl ? `
            <a href="${hotel.bookingUrl}" target="_blank" rel="noopener noreferrer" class="btn-popup-maps">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> Buchung
            </a>` : '';

          const hotelPopup = `
            <div class="sight-map-popup">
              <div class="popup-top-badge">
                <span class="popup-day-tag"><i class="fa-solid fa-hotel"></i> Tag ${day}</span>
                <span class="popup-region-tag">Unterkunft</span>
              </div>
              <h4 class="popup-title">${escapeHtml(hotel.name)}</h4>
              <div class="popup-highlight">${escapeHtml(hotel.address)}</div>
              <div style="font-size:0.75rem; margin-bottom:0.5rem; line-height:1.4">
                <i class="fa-solid fa-clock"></i> Check-in: <strong>${escapeHtml(hotel.checkIn)}</strong><br>
                <i class="fa-solid fa-right-from-bracket"></i> Check-out: <strong>${escapeHtml(hotel.checkOut)}</strong>
              </div>
              <div class="popup-action-row">
                <button type="button" class="btn-popup-jump" onclick="jumpToDayAndHighlight(${day})">
                  <i class="fa-solid fa-calendar-day"></i> Zum Tagesplan
                </button>
                ${bookingBtn}
              </div>
            </div>
          `;
          L.marker(coords, { icon: hotelIcon }).bindPopup(hotelPopup, { maxWidth: 300 }).addTo(routeLayers.accommodations);
        });

        // LAYER 4: 📷 FOTOSPOTS (Spezifische Fotospots mit Tipps)
        routeLayers.photospots = L.layerGroup();
        ALL_SIGHTSEEING_SPOTS.forEach(spot => {
          if (!spot.photoTip) return;
          const photoIcon = L.divIcon({
            html: `<div class="photo-pin-bubble" title="Fotospot: ${escapeHtml(spot.name)}"><i class="fa-solid fa-camera"></i></div>`,
            className: 'custom-photo-pin',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
            popupAnchor: [0, -18]
          });
          const photoPopup = `
            <div class="sight-map-popup">
              <div class="popup-top-badge">
                <span class="popup-day-tag"><i class="fa-solid fa-camera"></i> Tag ${spot.day}</span>
                <span class="popup-region-tag">Fotospot</span>
              </div>
              <h4 class="popup-title">${escapeHtml(spot.name)}</h4>
              <div class="popup-photo-tip" style="margin-top:0.4rem">
                <i class="fa-solid fa-camera"></i>
                <div>${spot.photoTip}</div>
              </div>
              <div class="popup-action-row">
                <button type="button" class="btn-popup-jump" onclick="jumpToDayAndHighlight(${spot.day}, ${spot.id})">
                  <i class="fa-solid fa-calendar-day"></i> Zum Tagesplan
                </button>
              </div>
            </div>
          `;
          L.marker(spot.coords, { icon: photoIcon }).bindPopup(photoPopup, { maxWidth: 300 }).addTo(routeLayers.photospots);
        });

        // Standardmäßig aktive Layer auf die Karte legen
        if (routeLayerStates.destinations) routeLayers.destinations.addTo(routeInteractiveMap);
        if (routeLayerStates.highlights) routeLayers.highlights.addTo(routeInteractiveMap);
        if (routeLayerStates.accommodations) routeLayers.accommodations.addTo(routeInteractiveMap);
        if (routeLayerStates.photospots) routeLayers.photospots.addTo(routeInteractiveMap);

        renderRouteDaysPills();
        setupTimelineMapSync();

        // WICHTIG: Mehrfach gestaffelte invalidateSize Aufrufe (sofort, next RAF, nach Opacity-Animation)
        routeInteractiveMap.invalidateSize({ pan: false });
        requestAnimationFrame(() => {
          if (routeInteractiveMap) routeInteractiveMap.invalidateSize({ pan: false });
        });
        setTimeout(() => {
          if (routeInteractiveMap) routeInteractiveMap.invalidateSize({ pan: false });
        }, 120);
        setTimeout(() => {
          if (routeInteractiveMap) routeInteractiveMap.invalidateSize({ pan: false });
        }, 400);

      } catch (err) {
        console.error('Fehler bei der Initialisierung der Route-Leaflet-Map:', err);
      } finally {
        routeMapInitializing = false;
      }
    }

    function switchRouteMapMode(mode) {
      const tabLeaflet = document.getElementById('tab-btn-leaflet');
      const tabGoogle = document.getElementById('tab-btn-google');
      const viewLeaflet = document.getElementById('view-leaflet-map');
      const viewGoogle = document.getElementById('view-google-map');
      const filterBar = document.getElementById('route-region-filter-bar');

      if (mode === 'leaflet') {
        if (tabLeaflet) tabLeaflet.classList.add('active');
        if (tabGoogle) tabGoogle.classList.remove('active');
        if (viewLeaflet) viewLeaflet.style.display = 'block';
        if (viewGoogle) viewGoogle.style.display = 'none';
        if (filterBar) filterBar.style.display = 'flex';

        ensureRouteMapReady();
        setTimeout(ensureRouteMapReady, 60);
      } else {
        if (tabGoogle) tabGoogle.classList.add('active');
        if (tabLeaflet) tabLeaflet.classList.remove('active');
        if (viewLeaflet) viewLeaflet.style.display = 'none';
        if (viewGoogle) viewGoogle.style.display = 'block';
        if (filterBar) filterBar.style.display = 'none';
      }
    }

    function filterRouteRegion(region, btnEl) {
      if (btnEl) {
        document.querySelectorAll('.route-filter-btn').forEach(btn => btn.classList.remove('active'));
        btnEl.classList.add('active');
      }
      if (!routeInteractiveMap) {
        ensureRouteMapReady();
        if (!routeInteractiveMap) return;
      }

      const bounds = L.latLngBounds([]);
      let matchCount = 0;

      routeMapMarkers.forEach(({ marker, spot }) => {
        if (region === 'all' || spot.region === region) {
          if (!routeInteractiveMap.hasLayer(marker)) {
            marker.addTo(routeInteractiveMap);
          }
          bounds.extend(spot.coords);
          matchCount++;
        } else {
          if (routeInteractiveMap.hasLayer(marker)) {
            routeInteractiveMap.removeLayer(marker);
          }
        }
      });

      if (matchCount > 0 && bounds.isValid()) {
        if (region === 'all') {
          routeInteractiveMap.setView([-28.5, 149.0], 5);
        } else {
          routeInteractiveMap.fitBounds(bounds, { padding: [45, 45], maxZoom: 13 });
        }
      }

      routeInteractiveMap.invalidateSize({ pan: false });
    }

    function resetRouteMapView() {
      activeFocusedDay = null;
      if (activeStageLayer && routeInteractiveMap) {
        routeInteractiveMap.removeLayer(activeStageLayer);
        activeStageLayer = null;
      }
      if (routeInteractiveMap) {
        activeStageMarkers.forEach(m => routeInteractiveMap.removeLayer(m));
      }
      activeStageMarkers = [];
      const stageInfo = document.getElementById('route-map-stage-info');
      if (stageInfo) stageInfo.style.display = 'none';
      document.querySelectorAll('.day-pill-btn').forEach(b => b.classList.remove('active'));
      const allPill = document.getElementById('day-pill-all');
      if (allPill) allPill.classList.add('active');

      const allBtn = document.querySelector('.route-filter-btn[data-region="all"]');
      if (allBtn) {
        filterRouteRegion('all', allBtn);
      } else if (routeInteractiveMap) {
        routeInteractiveMap.setView([-28.5, 149.0], 5);
        routeInteractiveMap.invalidateSize({ pan: false });
      }
    }

    function downloadEmergencyVCard() {
      const vcard = 'BEGIN:VCARD\r\nVERSION:3.0\r\nFN:🚨 Notruf Australien\r\nTEL;TYPE=CELL:000\r\nEND:VCARD';
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([vcard], { type: 'text/vcard' }));
      a.download = 'Australien_Notfall.vcf';
      a.click();
    }

    let deferredPwaPrompt = null;
    function triggerPwaPrompt() {
      if (deferredPwaPrompt) {
        deferredPwaPrompt.prompt();
        deferredPwaPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('[PWA] App-Installation vom Benutzer akzeptiert');
          }
          deferredPwaPrompt = null;
        });
      } else {
        alert('Australien Roadtrip 2027 App installieren:\n\n• iOS (Safari): Tippe unten auf die "Teilen"-Schaltfläche und wähle "Zum Home-Bildschirm".\n• Android (Chrome): Tippe oben rechts auf das Dreipunkt-Menü und wähle "App installieren".\n• Mac/PC (Chrome/Edge): Klicke auf das App-Symbol rechts in der Adressleiste.');
      }
    }

    // =========================================================================
    // WÄHRUNGSRECHNER (LIVE AUD ↔ EUR)
    // =========================================================================
    // currentAudToEurRate declared in top state variables block
    let isUpdatingConv = false;

    async function fetchExchangeRates(isManual = false) {
      const refreshIcon = document.getElementById('currency-refresh-icon');
      if (refreshIcon) refreshIcon.classList.add('fa-spin');

      try {
        let data = null;

        if (!data || !data.rate) {
          try {
            const directRes = await fetch('https://open.er-api.com/v6/latest/AUD', {signal:AbortSignal.timeout(4000)});
            if (directRes.ok) {
              const raw = await directRes.json();
              if (raw && raw.rates && raw.rates.EUR) {
                data = { rate: Number(raw.rates.EUR), updatedAt: raw.time_last_update_utc, source:'live', stale:false };
              }
            }
          } catch (e) { }
        }

        if (data && Number.isFinite(Number(data.rate)) && Number(data.rate) > 0) {
          currentAudToEurRate = Number(data.rate);
          // In LocalStorage als Offline-Fallback speichern
          try {
            localStorage.setItem(OFFLINE_RATE_KEY, currentAudToEurRate);
            localStorage.setItem(OFFLINE_RATE_TIME_KEY, new Date().toISOString());
          } catch (e) { }

          const eurRateFormatted = currentAudToEurRate.toFixed(4).replace('.', ',');
          const invRate = (1 / currentAudToEurRate).toFixed(4).replace('.', ',');

          const rateText = document.getElementById('currency-rate-text');
          if (rateText) {
            rateText.innerText = `1 AUD ≈ ${eurRateFormatted} EUR (1 EUR ≈ ${invRate} AUD)`;
          }

          const updateTime = document.getElementById('currency-update-time');
          if (updateTime) {
            const nowTime = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
            updateTime.innerHTML = `<i class="fa-solid fa-cloud-arrow-down" style=""></i> ${data.source === 'fallback' ? 'Ersatzkurs' : data.stale ? 'Gespeicherter Kurs' : 'Kursstand'}: ${data.updatedAt ? escapeHtml(new Date(data.updatedAt).toLocaleString('de-AT')) : 'Datum unbekannt'}`;
          }
        } else {
          // OFFLINE-FALLBACK AUS LOCALSTORAGE
          applyOfflineExchangeRateFallback();
        }
      } catch (err) {
        console.warn('Could not update live currency rates, using fallback:', err);
        applyOfflineExchangeRateFallback();
      } finally {
        if (refreshIcon) refreshIcon.classList.remove('fa-spin');
        recalcEurFromAud();
      }
    }

    function applyOfflineExchangeRateFallback() {
      try {
        const savedRate = localStorage.getItem(OFFLINE_RATE_KEY);
        const savedTime = localStorage.getItem(OFFLINE_RATE_TIME_KEY);
        if (savedRate) {
          currentAudToEurRate = parseFloat(savedRate) || 0.6209;
          const eurRateFormatted = currentAudToEurRate.toFixed(4).replace('.', ',');
          const invRate = (1 / currentAudToEurRate).toFixed(4).replace('.', ',');
          const rateText = document.getElementById('currency-rate-text');
          if (rateText) {
            rateText.innerText = `1 AUD ≈ ${eurRateFormatted} EUR (1 EUR ≈ ${invRate} AUD)`;
          }
          const updateTime = document.getElementById('currency-update-time');
          if (updateTime) {
            const dateStr = savedTime ? new Date(savedTime).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Gespeichert';
            updateTime.innerHTML = `<i class="fa-solid fa-database" style=""></i> Offline – zuletzt gespeicherte Daten werden angezeigt (${dateStr})`;
          }
        }
      } catch (e) { }
    }

    function recalcEurFromAud() {
      if (isUpdatingConv) return;
      isUpdatingConv = true;
      const audInput = document.getElementById('conv-aud-input');
      const eurInput = document.getElementById('conv-eur-input');
      if (audInput && eurInput) {
        const audVal = parseFloat(audInput.value);
        if (!isNaN(audVal)) {
          eurInput.value = (audVal * currentAudToEurRate).toFixed(2);
        } else {
          eurInput.value = '';
        }
      }
      isUpdatingConv = false;
    }

    function recalcAudFromEur() {
      if (isUpdatingConv) return;
      isUpdatingConv = true;
      const audInput = document.getElementById('conv-aud-input');
      const eurInput = document.getElementById('conv-eur-input');
      if (audInput && eurInput) {
        const eurVal = parseFloat(eurInput.value);
        if (!isNaN(eurVal) && currentAudToEurRate > 0) {
          audInput.value = (eurVal / currentAudToEurRate).toFixed(2);
        } else {
          audInput.value = '';
        }
      }
      isUpdatingConv = false;
    }

    function setCalcAud(amount) {
      const audInput = document.getElementById('conv-aud-input');
      if (audInput) {
        audInput.value = amount;
        recalcEurFromAud();
      }
    }

    function swapCurrencies() {
      const audInput = document.getElementById('conv-aud-input');
      const eurInput = document.getElementById('conv-eur-input');
      if (!audInput || !eurInput) return;

      const currentAudVal = parseFloat(audInput.value) || 0;
      const currentEurVal = parseFloat(eurInput.value) || 0;

      // Kehrt die Werte sauber um
      audInput.value = currentEurVal > 0 ? (currentEurVal / currentAudToEurRate).toFixed(2) : '100';
      recalcEurFromAud();
    }

    function initCurrencyConverter() {
      const audInput = document.getElementById('conv-aud-input');
      const eurInput = document.getElementById('conv-eur-input');
      if (audInput) {
        audInput.addEventListener('input', recalcEurFromAud);
      }
      if (eurInput) {
        eurInput.addEventListener('input', recalcAudFromEur);
      }
      fetchExchangeRates();
    }

    // =========================================================================
    // LIVE-WETTER (OPEN-METEO API FÜR SYDNEY, BRISBANE & MELBOURNE)
    // =========================================================================
    function getWeatherCodeInfo(code) {
      switch (code) {
        case 0:
          return { text: 'Klar / Sonnig', icon: 'fa-solid fa-sun', color: '#f59e0b' };
        case 1:
          return { text: 'Überwiegend sonnig', icon: 'fa-solid fa-cloud-sun', color: '#f59e0b' };
        case 2:
          return { text: 'Teilweise bewölkt', icon: 'fa-solid fa-cloud-sun', color: '#0284c7' };
        case 3:
          return { text: 'Bewölkt', icon: 'fa-solid fa-cloud', color: '#64748b' };
        case 45:
        case 48:
          return { text: 'Nebel / Dunst', icon: 'fa-solid fa-smog', color: '#94a3b8' };
        case 51:
        case 53:
        case 55:
          return { text: 'Leichter Nieselregen', icon: 'fa-solid fa-cloud-rain', color: '#0284c7' };
        case 61:
        case 63:
        case 65:
          return { text: 'Regen', icon: 'fa-solid fa-cloud-showers-heavy', color: '#0369a1' };
        case 80:
        case 81:
        case 82:
          return { text: 'Regenschauer', icon: 'fa-solid fa-cloud-sun-rain', color: '#0284c7' };
        case 95:
        case 96:
        case 99:
          return { text: 'Gewitter', icon: 'fa-solid fa-cloud-bolt', color: '#7c3aed' };
        default:
          return { text: 'Heiter', icon: 'fa-solid fa-cloud-sun', color: '#0284c7' };
      }
    }

    const OFFLINE_WEATHER_KEY = 'aus_roadtrip_weather_cache_v1';
    const OFFLINE_WEATHER_TIME_KEY = 'aus_roadtrip_weather_time_v1';

    const DEFAULT_FALLBACK_WEATHER = {
      sydney: {
        temp: 23,
        apparentTemp: 23,
        weatherCode: 1,
        windSpeed: 16,
        humidity: 62
      },
      brisbane: {
        temp: 27,
        apparentTemp: 28,
        weatherCode: 0,
        windSpeed: 14,
        humidity: 58
      },
      melbourne: {
        temp: 19,
        apparentTemp: 18,
        weatherCode: 2,
        windSpeed: 22,
        humidity: 55
      }
    };

    function applyOfflineWeatherFallback() {
      try {
        const cached = localStorage.getItem(OFFLINE_WEATHER_KEY);
        const savedTime = localStorage.getItem(OFFLINE_WEATHER_TIME_KEY);
        if (cached) {
          const data = JSON.parse(cached);
          if (data && data.sydney && data.brisbane && data.melbourne) {
            updateWeatherCityCard('sydney', data.sydney);
            updateWeatherCityCard('brisbane', data.brisbane);
            updateWeatherCityCard('melbourne', data.melbourne);
            const timeEl = document.getElementById('weather-last-updated');
            if (timeEl) {
              const dateStr = savedTime ? new Date(savedTime).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Gespeichert';
              timeEl.innerHTML = `<i class="fa-solid fa-database" style=""></i> Offline – zuletzt gespeicherte Daten werden angezeigt (${dateStr})`;
            }
            return true;
          }
        }
      } catch (e) { }

      updateWeatherCityCard('sydney', DEFAULT_FALLBACK_WEATHER.sydney);
      updateWeatherCityCard('brisbane', DEFAULT_FALLBACK_WEATHER.brisbane);
      updateWeatherCityCard('melbourne', DEFAULT_FALLBACK_WEATHER.melbourne);
      const timeEl = document.getElementById('weather-last-updated');
      if (timeEl) {
        timeEl.innerHTML = `<i class="fa-solid fa-cloud-sun" style=""></i> Offline – Richtwerte werden angezeigt`;
      }
      return false;
    }

    async function fetchLiveWeather(isManual = false) {
      const icon = document.getElementById('weather-refresh-icon');
      if (icon) icon.classList.add('fa-spin');

      // Sofort aus Cache oder Fallback befüllen, falls noch Ladezustand
      const timeEl = document.getElementById('weather-last-updated');
      if (timeEl && timeEl.innerText.includes('Lade Wetter')) {
        applyOfflineWeatherFallback();
      }

      if (!navigator.onLine) {
        applyOfflineWeatherFallback();
        if (icon) icon.classList.remove('fa-spin');
        return;
      }

      try {
        let weatherData = null;


        // Direct API requests work on static GitHub Pages hosting.
        if (!weatherData || !weatherData.sydney) {
          const directUrl = 'https://api.open-meteo.com/v1/forecast?latitude=-33.8688,-27.4698,-37.8136&longitude=151.2093,153.0251,144.9631&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m&timezone=auto';
          try {
            const directRes = await fetch(directUrl, { signal: AbortSignal.timeout(4000) });
            if (directRes.ok) {
              const raw = await directRes.json();
              if (Array.isArray(raw) && raw.length === 3) {
                weatherData = {
                  source:'live', stale:false, updatedAt:new Date().toISOString(),
                  sydney: {
                    temp: raw[0].current.temperature_2m,
                    apparentTemp: raw[0].current.apparent_temperature,
                    weatherCode: raw[0].current.weather_code,
                    windSpeed: raw[0].current.wind_speed_10m,
                    humidity: raw[0].current.relative_humidity_2m,
                    time: raw[0].current.time
                  },
                  brisbane: {
                    temp: raw[1].current.temperature_2m,
                    apparentTemp: raw[1].current.apparent_temperature,
                    weatherCode: raw[1].current.weather_code,
                    windSpeed: raw[1].current.wind_speed_10m,
                    humidity: raw[1].current.relative_humidity_2m,
                    time: raw[1].current.time
                  },
                  melbourne: {
                    temp: raw[2].current.temperature_2m,
                    apparentTemp: raw[2].current.apparent_temperature,
                    weatherCode: raw[2].current.weather_code,
                    windSpeed: raw[2].current.wind_speed_10m,
                    humidity: raw[2].current.relative_humidity_2m,
                    time: raw[2].current.time
                  }
                };
              }
            }
          } catch (e) { }
        }


        if (weatherData && weatherData.sydney) {
          try {
            localStorage.setItem(OFFLINE_WEATHER_KEY, JSON.stringify(weatherData));
            localStorage.setItem(OFFLINE_WEATHER_TIME_KEY, new Date().toISOString());
          } catch (e) { }

          updateWeatherCityCard('sydney', weatherData.sydney);
          updateWeatherCityCard('brisbane', weatherData.brisbane);
          updateWeatherCityCard('melbourne', weatherData.melbourne);

          if (timeEl) {
            const nowTime = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
            timeEl.innerHTML = `<i class="fa-solid fa-cloud-arrow-down" style=""></i> ${weatherData.stale ? 'Gespeichertes Wetter' : 'Messwerte'}: ${escapeHtml(weatherData.sydney.time || weatherData.updatedAt || 'Datum unbekannt')}`;
          }
        } else {
          applyOfflineWeatherFallback();
        }
      } catch (err) {
        console.warn('Live weather error, using fallback:', err);
        applyOfflineWeatherFallback();
      } finally {
        if (icon) icon.classList.remove('fa-spin');
      }
    }

    function updateWeatherCityCard(cityKey, data) {
      if (!data) return;
      const tempEl = document.getElementById(`weather-temp-${cityKey}`);
      if (tempEl && data.temp !== undefined) {
        tempEl.innerText = `${Math.round(data.temp)}°C`;
      }

      const condEl = document.getElementById(`weather-cond-${cityKey}`);
      if (condEl && data.weatherCode !== undefined) {
        const info = getWeatherCodeInfo(data.weatherCode);
        condEl.innerHTML = `<i class="${info.icon}" style="font-size: 1.1rem"></i> <span>${info.text}</span>`;
      }

      const appEl = document.getElementById(`weather-app-${cityKey}`);
      if (appEl && data.apparentTemp !== undefined) {
        appEl.innerText = `${Math.round(data.apparentTemp)}°C`;
      }

      const windEl = document.getElementById(`weather-wind-${cityKey}`);
      if (windEl && data.windSpeed !== undefined) {
        windEl.innerText = `${Math.round(data.windSpeed)} km/h`;
      }

      const humEl = document.getElementById(`weather-hum-${cityKey}`);
      if (humEl && data.humidity !== undefined) {
        humEl.innerText = `${Math.round(data.humidity)}%`;
      }
    }

    // =========================================================================
    // VOR-ORT BUDGET (TASCHENGELD AUSTRALIEN)
    // =========================================================================
    const ONSITE_SPEND_KEY = 'aus_onsite_budget';

    function getOnsiteSpendAmount() {
      const daily = localStorage.getItem('aus_onsite_daily_v2');
      if (daily !== null && Number.isFinite(Number(daily))) return Math.max(0, Number(daily));
      const saved = localStorage.getItem(ONSITE_SPEND_KEY);
      return saved !== null && Number.isFinite(Number(saved)) ? Math.max(0, Number(saved) / 20) : 65;
    }

    function setOnsiteSpend(val) {
      updateOnsiteSpend(val, 'preset');
    }

    function updateOnsiteSpend(val, source) {
      let num = parseFloat(val);
      if (isNaN(num) || num < 0) num = 0;
      localStorage.batch([['aus_onsite_daily_v2',num],[ONSITE_SPEND_KEY,num * currentMemoryDays().length]]);

      const input = document.getElementById('onsite-spend-input');
      const slider = document.getElementById('onsite-spend-slider');
      if (input && source !== 'input') input.value = num;
      if (slider && source !== 'slider') slider.value = num;

      updateOnsiteSpendMetrics();

      const includeOnsiteCb = document.getElementById('chart-include-onsite');
      if (includeOnsiteCb && includeOnsiteCb.checked) {
        renderBudgetDoughnutChart();
      }
    }

    function updateOnsiteSpendMetrics() {
      const daily = getOnsiteSpendAmount(), count = currentMemoryDays().length;
      const label = document.getElementById('onsite-total-label');
      if (label) label.textContent = `Budget ${count} Tage${window.FinanceView?.getMode() === 'person' ? ' pro Person' : ' für 4 Personen'}:`;
      const dailyLabel = document.getElementById('onsite-daily-label');
      if (dailyLabel) dailyLabel.textContent = window.FinanceView?.getMode() === 'person' ? 'Ausgaben pro Tag / Person:' : 'Ausgaben pro Tag (4 Personen):';
      document.getElementById('onsite-daily-eur').textContent = `${((window.FinanceView?.amount(daily * 4)) ?? daily * 4).toLocaleString('de-AT')} €`;
      document.getElementById('onsite-total-trip').textContent = `${((window.FinanceView?.amount(daily * 4 * count)) ?? daily * 4 * count).toLocaleString('de-AT')} € (${count} Tage)`;
    }

    function initOnsiteSpend() {
      const saved = getOnsiteSpendAmount();
      const input = document.getElementById('onsite-spend-input');
      const slider = document.getElementById('onsite-spend-slider');
      if (input) input.value = saved;
      if (slider) slider.value = saved;
      updateOnsiteSpendMetrics();
    }

    function openFuelTracker() {
      openBudgetDetails('fuel-budget-card');
    }

    function openBudgetDetails(targetId) {
      const budgetSec = document.getElementById('budget');
      if (budgetSec) {
        budgetSec.classList.add('revealed');
        budgetSec.classList.remove('from-bottom', 'from-top');
        budgetSec.querySelectorAll('.scroll-tab, .scroll-reveal').forEach(el => {
          el.classList.add('revealed');
          el.classList.remove('from-bottom', 'from-top');
        });
      }
      const budgetSlide = document.getElementById('budget-details-slide');
      if (budgetSlide) {
        budgetSlide.open = true;
      }
      let el = targetId ? document.getElementById(targetId) : null;
      if (!el && (targetId === 'budget-overview-chart' || targetId === 'budget-charts-main-card')) {
        el = document.getElementById('budget-charts-main-card');
      }
      if (!el) el = budgetSec;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setTimeout(renderCurrentBudgetChart, 80);
      setTimeout(renderCurrentBudgetChart, 260);
      setTimeout(renderCurrentBudgetChart, 500);
    }


    // =========================================================================
    // D3.JS CHARTS: KOSTEN PRO TAG & GEPLANT VS. TATSÄCHLICH
    // =========================================================================

    // 1. Chart: Kosten pro Tag (Tag 1–20)
    function renderDailyBudgetBarChart() {
      const container = document.getElementById('budget-daily-chart-container');
      if (!container || typeof d3 === 'undefined') return;
      container.innerHTML = '';

      const toggle = document.getElementById('person-toggle');
      const isPerPerson = toggle ? toggle.checked : true;
      const multiplier = isPerPerson ? 1 : 4;

      // Berechne geplante und tatsächliche Ausgaben pro Tag für alle 20 Tage
      const dailyData = [];
      for (let day = 1; day <= 20; day++) {
        const plannedItem = DAY_PLANNED_EXPENSES[day] || { amount: 65, label: 'Tagesprogramm' };
        const plannedAmount = plannedItem.amount * multiplier;

        // Tatsächliche Ausgaben an diesem Tag
        const dayExpenses = userExpenses.filter(e => e.dayNum === day);
        let actualAmount = 0;
        dayExpenses.forEach(e => {
          actualAmount += (isPerPerson ? (e.payer === 'Gruppe' ? e.amountEur / 4 : e.amountEur) : (e.payer === 'Gruppe' ? e.amountEur : e.amountEur * 4));
        });

        const dayTrip = TRIP_DAYS[day - 1];
        dailyData.push({
          day,
          date: dayTrip ? dayTrip.date.split('-').reverse().slice(0, 2).join('.') : `T${day}`,
          title: dayTrip ? dayTrip.title : `Tag ${day}`,
          planned: plannedAmount,
          actual: Math.round(actualAmount)
        });
      }

      const margin = { top: 20, right: 15, bottom: 45, left: 45 };
      const width = container.clientWidth || 600;
      const height = 280;
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const svg = d3.select(container)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('class', 'd3-chart-svg');

      const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

      const x = d3.scaleBand()
        .domain(dailyData.map(d => `T${d.day}`))
        .range([0, innerWidth])
        .padding(0.24);

      const maxVal = d3.max(dailyData, d => Math.max(d.planned, d.actual)) || 500;
      const y = d3.scaleLinear()
        .domain([0, maxVal * 1.15])
        .range([innerHeight, 0]);

      // X-Achse
      g.append('g')
        .attr('transform', `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(x).tickSize(0))
        .selectAll('text')
        .style('font-size', '10px')
        .style('font-weight', '600')
        .style('fill', 'var(--text-muted)')
        .attr('dy', '0.7em');

      // Y-Achse
      g.append('g')
        .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + '€').tickSize(-innerWidth))
        .call(g => g.select('.domain').remove())
        .call(g => g.selectAll('.tick line').attr('stroke', 'var(--border-color)').attr('stroke-dasharray', '2,2'))
        .selectAll('text')
        .style('font-size', '10px')
        .style('fill', 'var(--text-muted)');

      const tooltip = document.getElementById('d3-chart-universal-tooltip');

      // Geplante Balken (Hintergrund / Kontur)
      g.selectAll('.bar-planned')
        .data(dailyData)
        .enter()
        .append('rect')
        .attr('class', 'd3-bar-rect bar-planned')
        .attr('x', d => x(`T${d.day}`))
        .attr('y', d => y(d.planned))
        .attr('width', x.bandwidth())
        .attr('height', d => Math.max(0, innerHeight - y(d.planned)))
        .attr('fill', '#006d68')
        .attr('opacity', 0.28)
        .attr('rx', 3);

      // Tatsächliche Ausgaben (Vordergrund)
      g.selectAll('.bar-actual')
        .data(dailyData)
        .enter()
        .append('rect')
        .attr('class', 'd3-bar-rect bar-actual')
        .attr('x', d => x(`T${d.day}`))
        .attr('y', d => y(d.actual))
        .attr('width', x.bandwidth())
        .attr('height', d => Math.max(0, innerHeight - y(d.actual)))
        .attr('fill', '#f59e0b')
        .attr('rx', 3)
        .on('mouseenter', (event, d) => {
          if (!tooltip) return;
          tooltip.style.display = 'block';
          tooltip.innerHTML = `
            <strong>Tag ${d.day} (${d.date}): ${escapeHtml(d.title)}</strong><br>
            • Geplant: <strong>${d.planned} €</strong><br>
            • Tatsächlich erfasst: <strong>${d.actual} €</strong><br>
            <span style="font-size:0.7rem">Klicken, um Tag im Reiseplan zu öffnen</span>
          `;
        })
        .on('mousemove', (event) => {
          if (!tooltip) return;
          const rect = container.getBoundingClientRect();
          tooltip.style.left = (event.clientX - rect.left + 15) + 'px';
          tooltip.style.top = (event.clientY - rect.top - 20) + 'px';
        })
        .on('mouseleave', () => {
          if (tooltip) tooltip.style.display = 'none';
        })
        .on('click', (event, d) => {
          jumpToDayAndHighlight(d.day);
        });
    }

    // 2. Chart: Geplant vs. Tatsächlich (Soll-Ist-Vergleich aller 8 Kategorien)
    function renderPlannedVsActualChart() {
      const container = document.getElementById('budget-vs-chart-container');
      if (!container || typeof d3 === 'undefined') return;
      container.innerHTML = '';

      const toggle = document.getElementById('person-toggle');
      const isPerPerson = toggle ? toggle.checked : true;
      const multiplier = isPerPerson ? 1 : 4;

      const keys = Object.keys(BUDGET_CATEGORIES_CONFIG);
      const comparisonData = keys.map(k => {
        const cfg = BUDGET_CATEGORIES_CONFIG[k];
        const planned = Math.round(cfg.plannedEurP * multiplier);

        // Tatsächlich in dieser Kategorie erfasst
        const exps = userExpenses.filter(e => e.category === k);
        let actual = 0;
        exps.forEach(e => {
          actual += (isPerPerson ? (e.payer === 'Gruppe' ? e.amountEur / 4 : e.amountEur) : (e.payer === 'Gruppe' ? e.amountEur : e.amountEur * 4));
        });

        // Spritrechner zusätzlich in Benzin einfließen lassen
        if (k === 'fuel') {
          const fuelEur = fuelEntries.reduce((sum, item) => sum + (parseFloat(item.costEur) || 0), 0);
          actual = Math.max(actual, isPerPerson ? fuelEur / 4 : fuelEur);
        }

        return {
          id: k,
          label: cfg.label,
          color: cfg.color,
          icon: cfg.icon,
          planned,
          actual: Math.round(actual),
          diff: Math.round(planned - actual)
        };
      });

      const margin = { top: 15, right: 30, bottom: 25, left: 115 };
      const width = container.clientWidth || 600;
      const height = 320;
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const svg = d3.select(container)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('class', 'd3-chart-svg');

      const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

      const y = d3.scaleBand()
        .domain(comparisonData.map(d => d.label))
        .range([0, innerHeight])
        .padding(0.28);

      const maxVal = d3.max(comparisonData, d => Math.max(d.planned, d.actual)) || 1000;
      const x = d3.scaleLinear()
        .domain([0, maxVal * 1.15])
        .range([0, innerWidth]);

      // Y-Achse
      g.append('g')
        .call(d3.axisLeft(y).tickSize(0))
        .call(g => g.select('.domain').remove())
        .selectAll('text')
        .style('font-size', '11px')
        .style('font-weight', '700')
        .style('fill', 'var(--text-main)')
        .attr('dx', '-0.5em');

      // X-Achse
      g.append('g')
        .attr('transform', `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d => d + '€').tickSize(-innerHeight))
        .call(g => g.select('.domain').remove())
        .call(g => g.selectAll('.tick line').attr('stroke', 'var(--border-color)').attr('stroke-dasharray', '2,2'))
        .selectAll('text')
        .style('font-size', '10px')
        .style('fill', 'var(--text-muted)');

      const tooltip = document.getElementById('d3-chart-universal-tooltip');
      const barHeight = y.bandwidth() / 2;

      // Geplante Balken (Obere Balkenhälfte)
      g.selectAll('.bar-vs-planned')
        .data(comparisonData)
        .enter()
        .append('rect')
        .attr('class', 'd3-bar-rect bar-vs-planned')
        .attr('x', 0)
        .attr('y', d => y(d.label))
        .attr('width', d => Math.max(0, x(d.planned)))
        .attr('height', barHeight - 1)
        .attr('fill', 'rgba(100, 116, 139, 0.4)')
        .attr('rx', 2);

      // Tatsächliche Balken (Untere Balkenhälfte)
      g.selectAll('.bar-vs-actual')
        .data(comparisonData)
        .enter()
        .append('rect')
        .attr('class', 'd3-bar-rect bar-vs-actual')
        .attr('x', 0)
        .attr('y', d => y(d.label) + barHeight + 1)
        .attr('width', d => Math.max(0, x(d.actual)))
        .attr('height', barHeight - 1)
        .attr('fill', d => d.actual > d.planned ? '#ef4444' : d.color)
        .attr('rx', 2)
        .on('mouseenter', (event, d) => {
          if (!tooltip) return;
          tooltip.style.display = 'block';
          const statusText = d.diff >= 0 ? `<span style="">Noch ${d.diff} € im Budget</span>` : `<span style="">Um ${Math.abs(d.diff)} € überschritten</span>`;
          tooltip.innerHTML = `
            <strong>${escapeHtml(d.label)}</strong><br>
            • Geplant: <strong>${d.planned} €</strong><br>
            • Tatsächlich erfasst: <strong>${d.actual} €</strong><br>
            • Status: ${statusText}
          `;
        })
        .on('mousemove', (event) => {
          if (!tooltip) return;
          const rect = container.getBoundingClientRect();
          tooltip.style.left = (event.clientX - rect.left + 15) + 'px';
          tooltip.style.top = (event.clientY - rect.top - 20) + 'px';
        })
        .on('mouseleave', () => {
          if (tooltip) tooltip.style.display = 'none';
        });
    }


    // =========================================================================
    // D3.JS DOUGHNUT CHART (BUDGET KATEGORIEN)
    // =========================================================================
    function getBudgetCategoryData() {
      const toggle = document.getElementById('person-toggle');
      const isPerPerson = toggle ? toggle.checked : true;
      const multiplier = isPerPerson ? 1 : 4;

      const catConfig = BUDGET_CATEGORIES_CONFIG;
      const onsiteSpend = getOnsiteSpendAmount() * currentMemoryDays().length * multiplier;

      // 8 Standard-Kategorien (Soll-Kalkulation)
      const categories = [
        { id: 'flights', label: 'Flüge', amount: catConfig.flights.plannedEurP * multiplier, color: '#006d68', icon: 'fa-plane', desc: '4 Flüge (Langstrecke & Inlandsflüge)' },
        { id: 'hotels', label: 'Unterkunft', amount: catConfig.hotels.plannedEurP * multiplier, color: '#d96b27', icon: 'fa-hotel', desc: '7 Hotels & AirBnBs an allen Stopps' },
        { id: 'car', label: 'Mietwagen', amount: catConfig.car.plannedEurP * multiplier, color: '#0284c7', icon: 'fa-car', desc: 'Mietwagen & Greyhound Nachtbus' },
        { id: 'fuel', label: 'Benzin', amount: catConfig.fuel.plannedEurP * multiplier, color: '#eab308', icon: 'fa-gas-pump', desc: 'Sprit für ca. 2.100 km Roadtrip' },
        { id: 'food', label: 'Essen & Drinks', amount: (catConfig.food.plannedEurP * multiplier) + (onsiteSpend * 0.45), color: '#10b981', icon: 'fa-utensils', desc: 'Restaurants, Cafés, Pubs & Drinks' },
        { id: 'activities', label: 'Aktivitäten', amount: catConfig.activities.plannedEurP * multiplier, color: '#8b5cf6', icon: 'fa-ticket', desc: 'Whitsundays, K’gari, Zoo & Heli' },
        { id: 'groceries', label: 'Einkäufe', amount: (catConfig.groceries.plannedEurP * multiplier) + (onsiteSpend * 0.35), color: '#ec4899', icon: 'fa-cart-shopping', desc: 'Coles/Woolies Selbstversorgung & Esky' },
        { id: 'misc', label: 'Sonstiges', amount: (catConfig.misc.plannedEurP * multiplier) + (onsiteSpend * 0.20), color: '#64748b', icon: 'fa-box-archive', desc: 'SIM, Parken, Maut & Vor-Ort Spesen' }
      ];

      return { categories, isPerPerson };
    }

    function renderBudgetDoughnutChart() {
      const container = document.getElementById('budget-doughnut-svg-container');
      const legendContainer = document.getElementById('budget-doughnut-legend');
      if (!container || !legendContainer) return;

      const { categories, isPerPerson } = getBudgetCategoryData();
      const total = categories.reduce((sum, c) => sum + c.amount, 0);

      const modeBadge = document.getElementById('chart-sub-mode');
      if (modeBadge) {
        modeBadge.innerText = isPerPerson ? 'Kosten pro Person' : 'Gesamtkosten (4 Pers.)';
      }

      let legendHtml = '<div class="doughnut-legend-list">';
      categories.forEach((cat, idx) => {
        const pct = total > 0 ? ((cat.amount / total) * 100).toFixed(1) : '0';
        legendHtml += `
          <div class="doughnut-legend-item" id="legend-item-${cat.id}"
               onmouseenter="highlightChartSlice(${idx})"
               onmouseleave="resetChartHighlight()"
               onclick="highlightChartSlice(${idx})">
            <div class="legend-item-left">
              <span class="legend-color-dot" style=""></span>
              <div>
                <div class="legend-item-title"><i class="fa-solid ${cat.icon}" style="margin-right: 0.35rem; font-size: 0.85rem"></i>${escapeHtml(cat.label)}</div>
                <div style="font-size: 0.73rem">${escapeHtml(cat.desc)}</div>
              </div>
            </div>
            <div class="legend-item-right">
              <span class="legend-item-val">${Math.round(cat.amount).toLocaleString('de-DE')} €</span>
              <span class="legend-item-pct">(${pct}%)</span>
            </div>
          </div>
        `;
      });
      legendHtml += '</div>';
      legendContainer.innerHTML = legendHtml;

      resetChartHighlight();

      container.innerHTML = '';
      const size = 280;
      const radius = size / 2;
      const innerRadius = 76;
      const outerRadius = radius - 12;

      if (typeof d3 !== 'undefined') {
        const svg = d3.select(container)
          .append('svg')
          .attr('viewBox', `0 0 ${size} ${size}`)
          .attr('width', '100%')
          .attr('height', '100%');

        const g = svg.append('g')
          .attr('transform', `translate(${radius}, ${radius})`);

        const pie = d3.pie()
          .value(d => d.amount)
          .sort(null)
          .padAngle(0.026);

        const arc = d3.arc()
          .innerRadius(innerRadius)
          .outerRadius(outerRadius)
          .cornerRadius(5);

        const pieData = pie(categories);

        g.selectAll('path')
          .data(pieData)
          .enter()
          .append('path')
          .attr('class', 'chart-arc')
          .attr('id', (d, i) => `chart-arc-${i}`)
          .attr('d', arc)
          .attr('fill', d => d.data.color)
          .attr('stroke', 'var(--card-bg)')
          .attr('stroke-width', 2.5)
          .on('mouseenter', function (event, d) {
            const idx = pieData.indexOf(d);
            highlightChartSlice(idx);
          })
          .on('mouseleave', function () {
            resetChartHighlight();
          });

      } else {
        renderFallbackSvgDonut(container, categories, total, isPerPerson);
      }
    }

    function highlightChartSlice(index) {
      const { categories, isPerPerson } = getBudgetCategoryData();
      const total = categories.reduce((sum, c) => sum + c.amount, 0);
      const cat = categories[index];
      if (!cat) return;

      const pct = total > 0 ? ((cat.amount / total) * 100).toFixed(1) : '0';

      const centerSub = document.getElementById('chart-center-sub');
      const centerVal = document.getElementById('chart-center-val');
      const centerPct = document.getElementById('chart-center-pct');
      if (centerSub) centerSub.textContent = cat.label;
      if (centerVal) {
        centerVal.textContent = `${Math.round(cat.amount).toLocaleString('de-DE')} €`;
        centerVal.style.color = cat.color;
      }
      if (centerPct) {
        centerPct.textContent = `${pct}% Anteil`;
        centerPct.style.color = cat.color;
      }

      if (typeof d3 !== 'undefined') {
        d3.selectAll('.chart-arc').each(function (d, i) {
          const isTarget = (i === index);
          d3.select(this)
            .transition()
            .duration(180)
            .attr('opacity', isTarget ? 1 : 0.4)
            .attr('transform', () => {
              if (isTarget) {
                const midAngle = (d.startAngle + d.endAngle) / 2;
                const x = Math.sin(midAngle) * 6;
                const y = -Math.cos(midAngle) * 6;
                return `translate(${x}, ${y})`;
              }
              return 'translate(0, 0)';
            });
        });
      }

      document.querySelectorAll('.doughnut-legend-item').forEach((item, i) => {
        item.classList.toggle('highlighted', i === index);
      });
    }

    function resetChartHighlight() {
      const { categories, isPerPerson } = getBudgetCategoryData();
      const total = categories.reduce((sum, c) => sum + c.amount, 0);

      const centerSub = document.getElementById('chart-center-sub');
      const centerVal = document.getElementById('chart-center-val');
      const centerPct = document.getElementById('chart-center-pct');
      if (centerSub) centerSub.textContent = 'Gesamtkosten';
      if (centerVal) {
        centerVal.textContent = `${Math.round(total).toLocaleString('de-DE')} €`;
        centerVal.style.color = 'var(--text-main)';
      }
      if (centerPct) {
        centerPct.textContent = isPerPerson ? 'Kosten p.P.' : 'Gesamt (4 Pers.)';
        centerPct.style.color = 'var(--primary)';
      }

      if (typeof d3 !== 'undefined') {
        d3.selectAll('.chart-arc')
          .transition()
          .duration(180)
          .attr('opacity', 1)
          .attr('transform', 'translate(0, 0)');
      }

      document.querySelectorAll('.doughnut-legend-item').forEach(item => {
        item.classList.remove('highlighted');
      });
    }

    function renderFallbackSvgDonut(container, categories, total, isPerPerson) {
      const size = 280;
      const cx = 140, cy = 140;
      const rOuter = 126, rInner = 76;
      let accAngle = -Math.PI / 2;

      let pathsHtml = '';
      categories.forEach((cat, idx) => {
        if (cat.amount <= 0 || total <= 0) return;
        const angle = (cat.amount / total) * 2 * Math.PI;
        const start = accAngle;
        const end = accAngle + angle;
        accAngle = end;

        const x1 = cx + rOuter * Math.cos(start);
        const y1 = cy + rOuter * Math.sin(start);
        const x2 = cx + rOuter * Math.cos(end);
        const y2 = cy + rOuter * Math.sin(end);

        const x3 = cx + rInner * Math.cos(end);
        const y3 = cy + rInner * Math.sin(end);
        const x4 = cx + rInner * Math.cos(start);
        const y4 = cy + rInner * Math.sin(start);

        const largeArc = angle > Math.PI ? 1 : 0;
        const pathData = `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4} Z`;

        pathsHtml += `<path class="chart-arc" d="${pathData}" fill="${cat.color}" stroke="var(--card-bg)" stroke-width="2.5" onmouseenter="highlightChartSlice(${idx})" onmouseleave="resetChartHighlight()"></path>`;
      });

      container.innerHTML = `<svg viewBox="0 0 ${size} ${size}" width="100%" height="100%">${pathsHtml}</svg>`;
    }

    function initPwaAndOffline() {
      // 1. Service Worker registrieren
      if ('serviceWorker' in navigator) {
        const controlled = Boolean(navigator.serviceWorker.controller);
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!controlled) return;
          location.reload();
        });
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('./sw.js')
            .then((reg) => {
              console.log('[PWA] Service Worker erfolgreich registriert mit Scope:', reg.scope);
              reg.update().catch(err => console.warn('[PWA] Update-Prüfung:', err.message));
            })
            .catch((err) => {
              console.warn('[PWA] Service Worker Registrierung fehlgeschlagen:', err);
            });
        });
      }

      // 2. PWA Install Prompt Listener
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPwaPrompt = e;
      });

      // 3. Online/Offline Network Status Listener
      const updateNetworkStatus = (isOnline) => {
        const banner = document.getElementById('offline-status-banner');
        const textEl = document.getElementById('offline-status-text');
        if (!banner) return;

        if (!isOnline) {
          banner.classList.remove('is-online-restored');
          if (textEl) {
            textEl.innerHTML = '<strong>Offline-Modus</strong> · Alle Reisetage, Buchungen &amp; Journal verfügbar';
          }
          banner.style.display = 'flex';
        } else {
          banner.classList.add('is-online-restored');
          if (textEl) {
            textEl.innerHTML = '<i class="fa-solid fa-wifi"></i> <strong>Wieder online</strong> · Wetter &amp; Wechselkurse synchronisiert';
          }
          banner.style.display = 'flex';
          setTimeout(() => {
            banner.style.display = 'none';
          }, 3500);

          // Live-Wetter, Wechselkurse & Cloud-Sync automatisch aktualisieren
          if (typeof fetchLiveWeather === 'function') fetchLiveWeather(true);
          if (typeof fetchExchangeRates === 'function') fetchExchangeRates(true);
          if (typeof initCloudSync === 'function') initCloudSync();
        }
      };

      window.addEventListener('offline', () => updateNetworkStatus(false));
      window.addEventListener('online', () => updateNetworkStatus(true));

      // Initialer Check bei Start
      if (!navigator.onLine) {
        updateNetworkStatus(false);
      }
    }

    window.addEventListener('DOMContentLoaded', async () => {
      initPwaAndOffline();
      initTheme();
      updateTripDashboard();
      updateLiveTripStatus();
      setInterval(updateLiveTripStatus, 1000);
      initCurrencyConverter();
      initOnsiteSpend();
      loadUserExpenses();
      renderExpenseList();
      try { groceries = JSON.parse(localStorage.getItem(GROCERY_STORAGE_KEY)) || []; } catch (e) { }
      try { fuelEntries = JSON.parse(localStorage.getItem(FUEL_STORAGE_KEY)) || []; } catch (e) { }
      try { daySuggestions = JSON.parse(localStorage.getItem(SUGGESTIONS_STORAGE_KEY)) || {}; } catch (e) { }
      try { checkboxStates = JSON.parse(localStorage.getItem(CHECKBOX_STORAGE_KEY)) || {}; } catch (e) { }

      renderGroceries();
      renderFuel();
      renderCustomActivities();
      renderAllSuggestions();
      applyCheckboxStatesToUI();
      updateBudgetCalculations();
      renderCurrentBudgetChart();
      fetchLiveWeather();
      initScrollAnimations();
      initSmoothAccordions();
      setupRouteMapObserver();
      ensureRouteMapReady();
      renderRouteDaysPills();
      setupTimelineMapSync();
      initOrganization();

      const budgetSlide = document.getElementById('budget-details-slide');
      if (budgetSlide) {
        budgetSlide.addEventListener('toggle', () => {
          if (budgetSlide.open) {
            setTimeout(renderCurrentBudgetChart, 60);
          }
        });
      }

      const openBudgetIfTargeted = () => {
        if (window.location.hash === '#budget') {
          const budgetSlide = document.getElementById('budget-details-slide');
          if (budgetSlide) {
            budgetSlide.open = true;
            setTimeout(renderCurrentBudgetChart, 60);
          }
        }
      };
      window.addEventListener('hashchange', openBudgetIfTargeted);
      openBudgetIfTargeted();
      document.querySelectorAll('a[href="#budget"]').forEach(link => {
        link.addEventListener('click', () => {
          const budgetSlide = document.getElementById('budget-details-slide');
          if (budgetSlide) {
            budgetSlide.open = true;
            setTimeout(renderCurrentBudgetChart, 60);
          }
        });
      });

      localStorage.removeItem('aus_auth_token');
      await restoreSession();
    });

    // =========================================================================
    // OFF-CANVAS HAMBURGER DRAWER & MOBILE BOTTOM NAVIGATION CONTROLLER
    // =========================================================================
    function toggleDrawer(open) {
      const drawer = document.getElementById('mobile-drawer');
      const backdrop = document.getElementById('drawer-backdrop');
      if (!drawer || !backdrop) return;
      const shouldOpen = (open !== undefined) ? open : !drawer.classList.contains('is-open');
      if (shouldOpen) {
        drawer.classList.add('is-open');
        backdrop.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      } else {
        drawer.classList.remove('is-open');
        backdrop.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    }

    // Tastatur (Escape) & Wischgeste (Swipe to Close)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') toggleDrawer(false);
    }, { passive: true });

    let touchStartX = 0;
    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!touchStartX || !e.touches || e.touches.length === 0) return;
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = currentX - touchStartX;
      const diffY = Math.abs(currentY - touchStartY);

      // Nach rechts wischen schließt den Drawer (wenn horizontal gewischt wird)
      const drawer = document.getElementById('mobile-drawer');
      if (drawer && drawer.classList.contains('is-open') && diffX > 60 && diffY < 80) {
        toggleDrawer(false);
        touchStartX = 0;
      }
    }, { passive: true });

    // =========================================================================
    // AUFGABE 3/5: REISEORGANISATION (BUCHUNGEN & PACKLISTE)
    // =========================================================================
    const BOOKINGS_STORAGE_KEY = 'aus_roadtrip_bookings_2027';
    const PACKING_STORAGE_KEY = 'aus_roadtrip_packing_2027';

    // Standard-Buchungen (18 Positionen basierend auf realen Reisedaten & Budget)
    const DEFAULT_BOOKINGS_LIST = [
      {
        id: 'bkg-f1',
        category: 'flights',
        name: 'Langstreckenflug Scoot TR 12 (Wien ➔ Sydney via SIN)',
        provider: 'Scoot Airlines',
        bookingRef: 'TR12-VIE-SYD',
        date: '2027-03-21',
        time: '09:15',
        location: 'Flughafen Wien-Schwechat (VIE) Terminal 3',
        cost: 1812,
        currency: 'EUR',
        link: 'https://www.flyscoot.com',
        notes: 'Langstreckenflug für 4 Personen gebucht & bezahlt (453 € p.P.). Boarding 08:30 Uhr.',
        dayNum: 1,
        status: 'confirmed'
      },
      {
        id: 'bkg-h1',
        category: 'hotels',
        name: 'The Ultimo, Sydney (Chinatown / Haymarket)',
        provider: 'The Ultimo',
        bookingRef: 'ULT-849201',
        date: '2027-03-22',
        time: '14:00',
        location: '50 Jones St, Ultimo NSW 2007',
        cost: 476,
        currency: 'EUR',
        link: 'https://www.theultimo.com.au',
        notes: '3 Nächte (22.03. - 25.03.). Check-in ab 14:00 Uhr, Check-out bis 11:00 Uhr. 119 € p.P.',
        dayNum: 2,
        status: 'confirmed'
      },
      {
        id: 'bkg-f2',
        category: 'flights',
        name: 'Inlandsflug Virgin Australia VA 1141 (Sydney ➔ Ballina)',
        provider: 'Virgin Australia',
        bookingRef: 'VA1141-SYD-BNK',
        date: '2027-03-25',
        time: '08:30',
        location: 'Sydney Domestic Airport (SYD) Terminal 2',
        cost: 216,
        currency: 'EUR',
        link: 'https://www.virginaustralia.com',
        notes: 'Inlandsflug für 4 Personen (54 € p.P.). Gepäck 23kg p.P. inkludiert.',
        dayNum: 5,
        status: 'confirmed'
      },
      {
        id: 'bkg-c1',
        category: 'car',
        name: 'Mietwagen SUV East Coast (Ballina ➔ Hervey Bay / Brisbane)',
        provider: 'Hertz / Avis Car Rental',
        bookingRef: 'HZ-AU-938210',
        date: '2027-03-25',
        time: '10:15',
        location: 'Ballina Byron Gateway Airport (BNK)',
        cost: 620,
        currency: 'EUR',
        link: 'https://www.hertz.com.au',
        notes: 'Mietdauer Tage 5–11 (7 Tage). SUV/Van für 4 Personen + Gepäck. Vollkasko ohne SB.',
        dayNum: 5,
        status: 'confirmed'
      },
      {
        id: 'bkg-h2',
        category: 'hotels',
        name: 'AirBnB East Ballina (Byron Bay Region)',
        provider: 'Airbnb',
        bookingRef: 'HM9284KLM',
        date: '2027-03-25',
        time: '15:00',
        location: 'East Ballina, NSW 2478',
        cost: 300,
        currency: 'EUR',
        link: 'https://www.airbnb.at/rooms/1065553106126009714',
        notes: '2 Nächte (25.03. - 27.03.). Check-in per Schlüsselbox ab 15:00 Uhr. 75 € p.P.',
        dayNum: 5,
        status: 'confirmed'
      },
      {
        id: 'bkg-h3',
        category: 'hotels',
        name: 'Rambla at Story House (Brisbane)',
        provider: 'Rambla Hotels',
        bookingRef: 'RAM-391024',
        date: '2027-03-27',
        time: '14:00',
        location: 'Woolloongabba / Kangaroo Point, Brisbane QLD',
        cost: 476,
        currency: 'EUR',
        link: 'https://www.rambla.com.au/locations/story-house',
        notes: '3 Nächte (27.03. - 30.03.). Check-in ab 14:00 Uhr, Check-out bis 10:00 Uhr. 119 € p.P.',
        dayNum: 7,
        status: 'confirmed'
      },
      {
        id: 'bkg-h4',
        category: 'hotels',
        name: 'Villa Noosa Hotel (Noosaville)',
        provider: 'Villa Noosa',
        bookingRef: 'VN-58291',
        date: '2027-03-30',
        time: '14:00',
        location: '19 Mary St, Noosaville QLD 4566',
        cost: 134,
        currency: 'EUR',
        link: 'https://www.villanoosa.com.au',
        notes: '1 Nacht (30.03. - 31.03.). Check-in ab 14:00 Uhr. 33.50 € p.P.',
        dayNum: 10,
        status: 'confirmed'
      },
      {
        id: 'bkg-cp1',
        category: 'camping',
        name: 'Nationalpark & Camping Permit Noosa Everglades',
        provider: 'Queensland Parks & Wildlife (QPWS)',
        bookingRef: 'QPWS-2027-8841',
        date: '2027-03-30',
        time: '09:00',
        location: 'Cooloola Recreation Area, Great Sandy NP',
        cost: 60,
        currency: 'EUR',
        link: 'https://parks.desi.qld.gov.au',
        notes: 'Vehicle Access Permit & Camping Permit für Everglades / Cooloola Sandbahn.',
        dayNum: 10,
        status: 'confirmed'
      },
      {
        id: 'bkg-h5',
        category: 'hotels',
        name: 'Nightcap at Kondari Resort (Hervey Bay)',
        provider: 'Nightcap Hotels',
        bookingRef: 'NC-71249',
        date: '2027-03-31',
        time: '14:00',
        location: '49-63 Elizabeth St, Urangan QLD 4655',
        cost: 169,
        currency: 'EUR',
        link: 'https://nightcap.nighteliercollective.com.au',
        notes: '1 Nacht vor K’gari Tour (31.03. - 01.04.). Check-in ab 14:00 Uhr. 42.25 € p.P.',
        dayNum: 11,
        status: 'confirmed'
      },
      {
        id: 'bkg-t1',
        category: 'activities',
        name: 'K’gari Fraser Island 1-Day 4WD Explorer Tour',
        provider: 'K’gari Explorer Tours',
        bookingRef: 'KG-4WD-10294',
        date: '2027-04-01',
        time: '07:30',
        location: 'Urangan Marina / Abholung Resort, Hervey Bay QLD',
        cost: 756,
        currency: 'EUR',
        link: 'https://www.kgariexplorertours.com.au',
        notes: 'Ganztagestour für 4 Personen (189 € p.P.). Inkl. Fähre, Lake McKenzie, 75 Mile Beach, Eli Creek & Lunch.',
        dayNum: 12,
        status: 'confirmed'
      },
      {
        id: 'bkg-m1',
        category: 'misc',
        name: 'Greyhound Australia Nachtbus (Hervey Bay ➔ Airlie Beach)',
        provider: 'Greyhound Australia',
        bookingRef: 'GH-AU-847291',
        date: '2027-04-01',
        time: '20:30',
        location: 'Hervey Bay Transit Centre QLD',
        cost: 360,
        currency: 'EUR',
        link: 'https://www.greyhound.com.au',
        notes: 'Abfahrt 20:30 Uhr, Ankunft Airlie Beach ca. 08:30 Uhr (Tag 13). 4x Reclining Sleeper Seats (90 € p.P.).',
        dayNum: 12,
        status: 'confirmed'
      },
      {
        id: 'bkg-h6',
        category: 'hotels',
        name: 'Coral Sea Vista Apartments (Airlie Beach)',
        provider: 'Coral Sea Vista',
        bookingRef: 'BKG-CS-99120',
        date: '2027-04-02',
        time: '14:00',
        location: '20 The Esplanade, Airlie Beach QLD 4802',
        cost: 468,
        currency: 'EUR',
        link: 'https://www.booking.com/hotel/au/coral-sea-vista-apartments.de.html',
        notes: '3 Nächte (02.04. - 05.04.). Frühe Gepäckabgabe morgens nach Busankunft vereinbart. 117 € p.P.',
        dayNum: 13,
        status: 'confirmed'
      },
      {
        id: 'bkg-t2',
        category: 'activities',
        name: 'Whitsundays Katamaran Segeltour & Whitehaven Beach',
        provider: 'Camira Sailing / Cruise Whitsundays',
        bookingRef: 'WH-CAM-7721',
        date: '2027-04-03',
        time: '08:00',
        location: 'Coral Sea Marina, Airlie Beach QLD',
        cost: 600,
        currency: 'EUR',
        link: 'https://cruisewhitsundays.com',
        notes: 'Ganztägiger Segeltörn auf Katamaran Camira für 4 Personen (150 € p.P.). Inkl. Schnorcheln & BBQ.',
        dayNum: 14,
        status: 'confirmed'
      },
      {
        id: 'bkg-t3',
        category: 'activities',
        name: 'Whitsundays Helikopter Rundflug Heart Reef',
        provider: 'GSL Aviation',
        bookingRef: 'GSL-HELI-3382',
        date: '2027-04-04',
        time: '10:30',
        location: 'Whitsunday Airport, Shute Harbour QLD',
        cost: 856,
        currency: 'EUR',
        link: 'https://www.gslaviation.com.au',
        notes: '60 Minuten Helikopter Rundflug über Great Barrier Reef & Heart Reef (214 € p.P.).',
        dayNum: 15,
        status: 'confirmed'
      },
      {
        id: 'bkg-f3',
        category: 'flights',
        name: 'Inlandsflug Jetstar JQ 843 (Proserpine ➔ Melbourne)',
        provider: 'Jetstar Airways',
        bookingRef: 'JQ843-PPP-MEL',
        date: '2027-04-05',
        time: '12:45',
        location: 'Whitsunday Coast Airport (PPP), Proserpine QLD',
        cost: 540,
        currency: 'EUR',
        link: 'https://www.jetstar.com',
        notes: 'Direktflug nach Melbourne Tullamarine (135 € p.P. für 4 Personen). 20kg Aufgabegepäck.',
        dayNum: 16,
        status: 'confirmed'
      },
      {
        id: 'bkg-h7',
        category: 'hotels',
        name: 'Vibe Hotel Melbourne Docklands',
        provider: 'Vibe Hotels',
        bookingRef: 'VIB-MEL-40291',
        date: '2027-04-05',
        time: '14:00',
        location: '44 Aquitania Way, Docklands VIC 3008',
        cost: 643,
        currency: 'EUR',
        link: 'https://vibehotels.com',
        notes: '4 Nächte (05.04. - 09.04.). Check-in ab 14:00 Uhr, Check-out bis 11:00 Uhr. 160.75 € p.P.',
        dayNum: 16,
        status: 'confirmed'
      },
      {
        id: 'bkg-c2',
        category: 'car',
        name: 'Mietwagen Great Ocean Road (Melbourne City / Southern Cross)',
        provider: 'Europcar Melbourne',
        bookingRef: 'EP-MEL-551920',
        date: '2027-04-06',
        time: '08:00',
        location: 'Southern Cross Station, Melbourne VIC',
        cost: 200,
        currency: 'EUR',
        link: 'https://www.europcar.com.au',
        notes: '2 Tage Roadtrip Great Ocean Road (Tage 17–18). Rückgabe City Station Tag 18 abends.',
        dayNum: 17,
        status: 'confirmed'
      },
      {
        id: 'bkg-f4',
        category: 'flights',
        name: 'Rückflug Scoot TR 25 (Melbourne ➔ Wien via SIN)',
        provider: 'Scoot Airlines',
        bookingRef: 'TR25-MEL-VIE',
        date: '2027-04-09',
        time: '21:30',
        location: 'Melbourne Airport (MEL) Tullamarine Terminal 2',
        cost: 1804,
        currency: 'EUR',
        link: 'https://www.flyscoot.com',
        notes: 'Rückflug für 4 Personen (451 € p.P.). Ankunft in Wien an Tag 21.',
        dayNum: 20,
        status: 'confirmed'
      }
    ];

    // Standard-Packliste (55 Artikel, 10 Kategorien)
    const DEFAULT_PACKING_ITEMS = [
      // 1. Dokumente
      { id: 'pack-doc-1', category: 'docs', name: 'Reisepass (mind. 6 Monate über Reisedatum gültig)', quantity: '4x', note: 'Original & Farbkopienset. Digitale Kopie im Notfall-Tresor!', packed: false, link: '#emergency', linkLabel: 'Notfall-Tresor' },
      { id: 'pack-doc-2', category: 'docs', name: 'Australisches Visum (eVisitor Subclass 651)', quantity: '4x', note: 'Online erteilt & an Reisepass gekoppelt. PDFs im Notfall-Vault.', packed: false, link: '#emergency', linkLabel: 'Notfall-Vault' },
      { id: 'pack-doc-3', category: 'docs', name: 'Internationaler Führerschein (Klasse B)', quantity: 'mind. 2 Fahrer', note: 'Nur in Kombination mit nationalem EU-Führerschein in Australien gültig!', packed: false, link: '#emergency', linkLabel: 'Dokumente' },
      { id: 'pack-doc-4', category: 'docs', name: 'Nationaler EU-Kartenführerschein', quantity: 'mind. 2 Fahrer', note: 'Unbedingt im Original mitführen für Mietwagenübernahme.', packed: false, link: '#emergency', linkLabel: 'Notfall-Vault' },
      { id: 'pack-doc-5', category: 'docs', name: 'Kreditkarten (DKB / Visa / Mastercard ohne Fremdwährungsgebühr)', quantity: '2-3 Karten', note: 'Auf mind. 2 Personen verteilen. PINs auswendig merken.', packed: false, link: '#budget', linkLabel: 'Reisekasse' },
      { id: 'pack-doc-6', category: 'docs', name: 'Auslandskrankenversicherung Police & 24h-Notrufnummer', quantity: '1x', note: 'Mit Rückholversicherung und Übernahme für Tauch-/Wassersportunfälle.', packed: false, link: '#emergency', linkLabel: 'Notfall-Tresor' },
      { id: 'pack-doc-7', category: 'docs', name: 'Buchungsbestätigungen & Voucher (Flüge, Hotels, Mietwagen, Touren)', quantity: 'Alle Belege', note: 'Alle Buchungen zentral in der Website hinterlegt & offline abrufbar.', packed: false, link: '#organization', linkLabel: 'Buchungsmanager' },

      // 2. Technik
      { id: 'pack-tech-1', category: 'tech', name: 'Australien Reiseadapter (Steckdosen-Typ I, 3-polig gewinkelt)', quantity: '2-3x', note: 'Typ-I Adapter für australische Steckdosen (230V, 50Hz).', packed: false },
      { id: 'pack-tech-2', category: 'tech', name: 'Powerbank (20.000 mAh, flugzeugkonform max. 100 Wh)', quantity: '2x', note: 'WICHTIG: Nur im Handgepäck transportieren, verboten im Aufgabegepäck!', packed: false },
      { id: 'pack-tech-3', category: 'tech', name: 'USB-C & Lightning Schnellladekabel + Mehrfach-USB-Ladegerät', quantity: 'Set', note: '65W GaN Multi-Port Charger für gleichzeitiges Laden mehrerer Handys.', packed: false },
      { id: 'pack-tech-4', category: 'tech', name: 'Smartphone mit eSIM / Aussie-SIM-Ready', quantity: '4x', note: 'Telstra/Boost Mobile Netz für beste Outback- & Coastal-Abdeckung.', packed: false },
      { id: 'pack-tech-5', category: 'tech', name: 'Noise-Cancelling Kopfhörer (für 24h Langstreckenflug)', quantity: '4x', note: 'Inkl. Flugzeug-Klinkenadapter (Doppelklinke 3.5mm).', packed: false },
      { id: 'pack-tech-6', category: 'tech', name: 'Robuste Schutzhüllen / Wasserdichte Handyhülle (Lanyard)', quantity: '2x', note: 'Für Schnorcheltouren Whitsundays, K’gari & Noosa Everglades.', packed: false },

      // 3. Kamera
      { id: 'pack-cam-1', category: 'camera', name: 'Systemkamera / DSLR mit Weitwinkel- & Teleobjektiv', quantity: '1x', note: 'Weitwinkel für Küstenlandschaften & Tele (70-200mm) für Kängurus & Wale.', packed: false },
      { id: 'pack-cam-2', category: 'camera', name: 'Kamera-Ersatzakkus (mind. 2-3 Stück)', quantity: '3x', note: 'Nur im Handgepäck transportieren wegen IATA Lithium-Vorschriften.', packed: false },
      { id: 'pack-cam-3', category: 'camera', name: 'Schnelle SD-Karten (UHS-II / V60, mind. 128-256 GB)', quantity: '4x', note: 'Inkl. robuster wasser- und staubdichter Speicherkarten-Aufbewahrungsbox.', packed: false },
      { id: 'pack-cam-4', category: 'camera', name: 'Zirkular-Polfilter (CPL) & ND-Filter (Neutraldichte)', quantity: '2x', note: 'Essentiell für tiefblaues Meerwasser, Reflexionsreduktion & weiche Wellen.', packed: false },
      { id: 'pack-cam-5', category: 'camera', name: 'Kompaktes Reisestativ / GorillaPod', quantity: '1x', note: 'Für Milchstraßen-Astrofotografie im Outback & Sonnenuntergangszeitraffer.', packed: false },
      { id: 'pack-cam-6', category: 'camera', name: 'Objektiv-Reinigungsset & Blasebalg (Rocket Blower)', quantity: '1x', note: 'Feiner Sand auf Fraser Island & Whitehaven Beach erfordert Staubschutz!', packed: false },

      // 4. Drohne
      { id: 'pack-drn-1', category: 'drone', name: 'Drohne (DJI Mini / unter 249g)', quantity: '1x', note: 'CASA Drohnenregeln beachten: Max. 120m, 30m Abstand zu Menschen, Sichtlinie!', packed: false, link: '#drone-hub', linkLabel: 'Drohnen-Hub' },
      { id: 'pack-drn-2', category: 'drone', name: 'Drohnen-Akkus (Fly More Combo, 3x Intelligent Flight Batteries)', quantity: '3x', note: 'WICHTIG: Ausschließlich im Handgepäck in LiPo-Sicherheitstasche!', packed: false, link: '#drone-hub', linkLabel: 'CASA Regeln' },
      { id: 'pack-drn-3', category: 'drone', name: 'Drohnen-ND-Filterset (ND8, ND16, ND32, ND64 / PL)', quantity: 'Set', note: 'Unverzichtbar bei starker australischer Mittagssonne für flüssige 180°-Shutter-Videos.', packed: false, link: '#drone-hub', linkLabel: 'Filter-Guide' },
      { id: 'pack-drn-4', category: 'drone', name: 'Ersatzpropeller, Schraubendreher & faltbares Landepad', quantity: '1x', note: 'Landepad schützt Motoren vor feinstem Quarzsand (Whitehaven / 75 Mile Beach).', packed: false, link: '#drone-hub', linkLabel: 'Drohnen-Zonen' },

      // 5. Kleidung
      { id: 'pack-cloth-1', category: 'clothing', name: 'Atmungsaktive T-Shirts / Funktionsshirts', quantity: '6-8x', note: 'Schnelltrocknend, Merinowolle oder Mikrofaser ideal für Warm- und Übergangsklima.', packed: false },
      { id: 'pack-cloth-2', category: 'clothing', name: 'Leichte Shorts & Badeshorts / Bikinis', quantity: '3-4x', note: 'Für Strände in Byron Bay, Noosa & Whitsundays.', packed: false },
      { id: 'pack-cloth-3', category: 'clothing', name: 'Lange bequeme Hosen (Leinen / Zip-Off Wanderhose)', quantity: '2-3x', note: 'Schutz vor Moskitos in der Dämmerung und für kühle Abende in Melbourne.', packed: false },
      { id: 'pack-cloth-4', category: 'clothing', name: 'Fleecejacke / Leichter Pullover & Windbreaker', quantity: '1-2x', note: 'Melbourne und Great Ocean Road können im April windig und frisch (14–18°C) sein.', packed: false },
      { id: 'pack-cloth-5', category: 'clothing', name: 'Leichte Regenjacke / Hardshell (wasserdicht)', quantity: '1x', note: 'Für tropische Schauer in Queensland & windiges Wetter an der Küste.', packed: false },
      { id: 'pack-cloth-6', category: 'clothing', name: 'Feste Wanderschuhe / Trekkingsneaker mit Profilsohle', quantity: '1 Paar', note: 'Eingelaufen! Für Blue Mountains, Noosa National Park & K’gari Trails.', packed: false },
      { id: 'pack-cloth-7', category: 'clothing', name: 'Flip-Flops / Sandalen (Thongs)', quantity: '1 Paar', note: 'Aussie-Standard für Strand, Hostel & Campingduschen.', packed: false },
      { id: 'pack-cloth-8', category: 'clothing', name: 'UV-Schutzhut / Cap & Sonnenbrille mit UV400 / Polarisierung', quantity: '1x', note: 'UV-Index in Australien extrem hoch. Polarisierte Brille schützt & zeigt Riffdetails.', packed: false },

      // 6. Hygiene
      { id: 'pack-hyg-1', category: 'hygiene', name: 'Rifffreundliche Sonnencreme (LSF 50+ Broad Spectrum)', quantity: '2 Tuben', note: 'Ohne Oxybenzon & Octinoxat zum Schutz des Great Barrier Reefs.', packed: false },
      { id: 'pack-hyg-2', category: 'hygiene', name: 'Tropisches Mückenspray (Bushman / DEET 40% oder Picaridin)', quantity: '1-2x', note: 'Schutz vor Sandfliegen (Midges) und Moskitos an Mangroven & K’gari.', packed: false },
      { id: 'pack-hyg-3', category: 'hygiene', name: 'Kulturbeutel mit Haken & Reisegrößen (Shampoo, Duschgel)', quantity: '1x', note: 'Praktisch zum Aufhängen in Campingplätzen und Hotelbädern.', packed: false },
      { id: 'pack-hyg-4', category: 'hygiene', name: 'Schnelltrocknendes Mikrofaser-Badetuch (groß)', quantity: '1-2x', note: 'Leicht, platzsparend und trocknet in 30 Minuten in der Sonne.', packed: false },
      { id: 'pack-hyg-5', category: 'hygiene', name: 'After-Sun Lotion / Reines Aloe Vera Gel', quantity: '1x', note: 'Zur Beruhigung der Haut nach langen Sonnentagen am Pazifik.', packed: false },
      { id: 'pack-hyg-6', category: 'hygiene', name: 'Zahnpflege, biologisch abbaubare Feuchttücher & Desinfektionsgel', quantity: 'Set', note: 'Unverzichtbar für Roadtrip-Stopps ohne fließendes Wasser.', packed: false },

      // 7. Medikamente
      { id: 'pack-med-1', category: 'meds', name: 'Erste-Hilfe-Set (Pflaster, Blasenpflaster, sterile Kompressen, Tape)', quantity: '1 Set', note: 'Inkl. Pinzette für Splitter und Notfall-Wundschnellverband.', packed: false, link: '#emergency', linkLabel: 'Notfall-Infos' },
      { id: 'pack-med-2', category: 'meds', name: 'Schmerzmittel & Entzündungshemmer (Ibuprofen / Paracetamol)', quantity: '2 Packungen', note: 'Gegen Kopfschmerzen, Muskelkater und Fieber.', packed: false },
      { id: 'pack-med-3', category: 'meds', name: 'Magen-Darm-Medikamente (Imodium, Elektrolyte, Kohletabletten)', quantity: '1 Set', note: 'Schnelle Hilfe bei Reisedurchfall und Dehydration in der Hitze.', packed: false },
      { id: 'pack-med-4', category: 'meds', name: 'Reisekrankheits-Tabletten / Kaugummis (Travel Sickness)', quantity: '1 Pckg.', note: 'Sehr wichtig für die Katamaran-Tour Whitsundays und Greyhound Nachtbus!', packed: false },
      { id: 'pack-med-5', category: 'meds', name: 'Antihistaminikum / Fenistil Gel (Insektenstiche & Allergien)', quantity: '1 Tube', note: 'Lindert sofort Juckreiz bei Sandfliegenbissen und Quallenkontakt.', packed: false },
      { id: 'pack-med-6', category: 'meds', name: 'Persönliche Dauermedikation mit englischem Arztattest', quantity: 'Bedarf', note: 'Im Originalbehälter mitführen für australische Zoll- und Quarantänekontrolle.', packed: false, link: '#emergency', linkLabel: 'Notfall-Vault' },

      // 8. Auto & Roadtrip
      { id: 'pack-car-1', category: 'car', name: 'KFZ-Smartphone-Halterung (Lüftungsgitter / Saugnapf)', quantity: '1x', note: 'Australische Verkehrsstrafe für Handy in der Hand am Steuer extrem hoch (>1.000 AUD)!', packed: false },
      { id: 'pack-car-2', category: 'car', name: '12V KFZ-Schnellladegerät (Dual USB-C PD)', quantity: '1x', note: 'Hält Navigation und Akkus während stundenlanger Überlandfahrten geladen.', packed: false },
      { id: 'pack-car-3', category: 'car', name: 'Offline-Karten (Google Maps / Maps.me) vorab heruntergeladen', quantity: 'Offline', note: 'Zwischen Ballina und Airlie Beach oft kilometerweit kein Mobilfunkempfang.', packed: false },
      { id: 'pack-car-4', category: 'car', name: 'AUX-Kabel / Bluetooth FM-Transmitter & Sonnenblende', quantity: '1x', note: 'Für unsere Spotify Roadtrip-Playlist und Blendschutz bei Linksfahr-Sonnenaufgang.', packed: false, link: '#playlist', linkLabel: 'Playlist' },

      // 9. Camping & Strand
      { id: 'pack-cmp-1', category: 'camping', name: 'Wasserdichter Packsack / Dry Bag (10-20 Liter)', quantity: '2x', note: 'Schützt Kameras und Handys bei Schlauchboot- & Katamarantouren vor Salzwasser.', packed: false },
      { id: 'pack-cmp-2', category: 'camping', name: 'Stirnlampe / Taschenlampe mit Rotlichtfunktion', quantity: '2x', note: 'Für Nachtwanderungen, K’gari Camping & schonende Tierbeobachtung im Dunkeln.', packed: false },
      { id: 'pack-cmp-3', category: 'camping', name: 'Wiederverwendbare isolierte Edelstahl-Trinkflasche (1L)', quantity: '4x', note: 'Hält Wasser eiskalt. Kostenlose Trinkwasserstationen fast überall in Australien.', packed: false },
      { id: 'pack-cmp-4', category: 'camping', name: 'Eigenes Schnorchel-Set (Maske & Schnorchel)', quantity: 'Persönlich', note: 'Passt perfekt, bequemer und hygienischer als Leihmasken vor Ort.', packed: false },

      // 10. Sonstiges & Komfort
      { id: 'pack-misc-1', category: 'misc', name: 'Nackenhörnchen / Reisekissen & Schlafmaske + Ohrenstöpsel', quantity: '4x', note: 'Goldwert für den 24h Flug nach Sydney und die 12h Nachtbusfahrt nach Airlie Beach.', packed: false },
      { id: 'pack-misc-2', category: 'misc', name: 'Kompressions-Packwürfel (Packing Cubes)', quantity: '1 Set', note: 'Spart 40% Kofferplatz und hält Ordnung im Mietwagen-Kofferraum.', packed: false },
      { id: 'pack-misc-3', category: 'misc', name: 'Gepäckwaage (digital) & TSA-Kofferschlösser', quantity: '1x', note: 'Vermeidet teures Übergewicht bei Scoot & Jetstar Inlandsflügen (max 20kg).', packed: false },
      { id: 'pack-misc-4', category: 'misc', name: 'Faltbarer Tagesrucksack (15-20L) für Ausflüge', quantity: '2x', note: 'Ultraleicht, passt zusammengefaltet in jede Hosentasche.', packed: false }
    ];

    let userBookings = [];
    let userPacking = [];
    let currentPackingCatFilter = 'all';
    let currentPackingQuery = '';
    let currentPackingStatus = 'all';

    // Kategorien-Konfiguration für Icons und Labels
    const ORG_CATEGORY_META = {
      flights: { label: 'Flüge', icon: 'fa-plane-departure', color: 'cat-flights' },
      hotels: { label: 'Unterkünfte', icon: 'fa-hotel', color: 'cat-hotels' },
      car: { label: 'Mietwagen', icon: 'fa-car', color: 'cat-car' },
      activities: { label: 'Aktivitäten', icon: 'fa-person-hiking', color: 'cat-activities' },
      camping: { label: 'Camping', icon: 'fa-campground', color: 'cat-camping' },
      misc: { label: 'Sonstiges', icon: 'fa-ticket', color: 'cat-misc' }
    };

    function loadUserBookings() {
      function migrateBookings(list) {
        return (list || []).map(b => {
          const priceType = b.priceType || 'total';
          const factor = priceType === 'per_person' ? 4 : priceType === 'two_persons' ? 2 : 1;
          const rawPrice = parseFloat(b.price ?? (b.totalAmount != null ? b.totalAmount / factor : b.cost)) || 0;
          const totalAmount = b.totalAmount !== undefined ? b.totalAmount : (priceType === 'per_person' ? rawPrice * 4 : (priceType === 'two_persons' ? rawPrice * 2 : rawPrice));
          const perPersonAmount = b.perPersonAmount !== undefined ? b.perPersonAmount : (totalAmount / 4);
          return { ...b, price: rawPrice, priceType, totalAmount, perPersonAmount };
        });
      }
      try {
        const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
        if (raw !== null) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            userBookings = migrateBookings(parsed);
            return;
          }
        }
      } catch (e) { }
      userBookings = migrateBookings(JSON.parse(JSON.stringify(DEFAULT_BOOKINGS_LIST)));
      if (!saveUserBookings()) return;
    }

    function saveUserBookings() {
      try {
        localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(userBookings));
        return true;
      } catch (e) { return storageFailure(e); }
    }

    function loadUserPacking() {
      try {
        const raw = localStorage.getItem(PACKING_STORAGE_KEY);
        if (raw !== null) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            userPacking = parsed;
            return;
          }
        }
      } catch (e) { }
      userPacking = JSON.parse(JSON.stringify(DEFAULT_PACKING_ITEMS));
      if (!saveUserPacking()) return;
    }

    function saveUserPacking() {
      try {
        localStorage.setItem(PACKING_STORAGE_KEY, JSON.stringify(userPacking));
        return true;
      } catch (e) { return storageFailure(e); }
    }

    // Sub-Navigation Tab Switcher
    function switchOrgTab(tabName) {
      const btnBookings = document.getElementById('org-tab-btn-bookings');
      const btnPacking = document.getElementById('org-tab-btn-packing');
      const panelBookings = document.getElementById('org-panel-bookings');
      const panelPacking = document.getElementById('org-panel-packing');

      if (!btnBookings || !btnPacking || !panelBookings || !panelPacking) return;

      if (tabName === 'packing') {
        btnBookings.classList.remove('active');
        btnBookings.setAttribute('aria-selected', 'false');
        btnPacking.classList.add('active');
        btnPacking.setAttribute('aria-selected', 'true');
        panelBookings.style.display = 'none';
        panelPacking.style.display = 'block';
        document.querySelectorAll('.category-quick-tile').forEach(tile => {
          tile.classList.toggle('active', tile.getAttribute('data-org-cat') === 'packing');
        });
        renderPackingList();
      } else {
        btnPacking.classList.remove('active');
        btnPacking.setAttribute('aria-selected', 'false');
        btnBookings.classList.add('active');
        btnBookings.setAttribute('aria-selected', 'true');
        panelPacking.style.display = 'none';
        panelBookings.style.display = 'block';
        const curCat = document.getElementById('org-booking-filter-cat')?.value || 'all';
        const activeCat = (curCat === 'all') ? 'bookings' : curCat;
        document.querySelectorAll('.category-quick-tile').forEach(tile => {
          tile.classList.toggle('active', tile.getAttribute('data-org-cat') === activeCat);
        });
        renderBookings();
      }
    }

    // -------------------------------------------------------------------------
    // BUCHUNGEN LOGIK
    // -------------------------------------------------------------------------
    function renderBookings() {
      const container = document.getElementById('org-bookings-list-container');
      const countPill = document.getElementById('org-bookings-summary-count');
      const costPill = document.getElementById('org-bookings-summary-cost');
      const badgeCount = document.getElementById('org-badge-bookings-count');
      if (!container) return;

      const catFilter = document.getElementById('org-booking-filter-cat') ? document.getElementById('org-booking-filter-cat').value : 'all';
      const dayFilter = document.getElementById('org-booking-filter-day') ? document.getElementById('org-booking-filter-day').value : 'all';
      const searchVal = document.getElementById('org-booking-search') ? document.getElementById('org-booking-search').value.trim().toLowerCase() : '';
      const sortVal = document.getElementById('org-booking-sort') ? document.getElementById('org-booking-sort').value : 'day-asc';

      let filtered = [...userBookings];

      if (catFilter !== 'all') {
        filtered = filtered.filter(b => b.category === catFilter);
      }

      if (dayFilter !== 'all') {
        const d = parseInt(dayFilter, 10);
        filtered = filtered.filter(b => b.dayNum === d);
      }

      if (searchVal) {
        filtered = filtered.filter(b => {
          const matchName = (b.name || '').toLowerCase().includes(searchVal);
          const matchRef = (b.bookingRef || '').toLowerCase().includes(searchVal);
          const matchLoc = (b.location || '').toLowerCase().includes(searchVal);
          const matchProv = (b.provider || '').toLowerCase().includes(searchVal);
          const matchNotes = (b.notes || '').toLowerCase().includes(searchVal);
          return matchName || matchRef || matchLoc || matchProv || matchNotes;
        });
      }

      // Sortierung
      filtered.sort((a, b) => {
        if (sortVal === 'day-asc') {
          return (a.dayNum || 0) - (b.dayNum || 0) || (a.date || '').localeCompare(b.date || '');
        } else if (sortVal === 'day-desc') {
          return (b.dayNum || 0) - (a.dayNum || 0) || (b.date || '').localeCompare(a.date || '');
        } else if (sortVal === 'cost-desc') {
          return (b.cost || 0) - (a.cost || 0);
        } else if (sortVal === 'cost-asc') {
          return (a.cost || 0) - (b.cost || 0);
        } else if (sortVal === 'name-asc') {
          return (a.name || '').localeCompare(b.name || '');
        }
        return 0;
      });

      // Zähler & Summen aktualisieren
      if (badgeCount) badgeCount.textContent = userBookings.length;
      if (countPill) countPill.textContent = `${filtered.length} von ${userBookings.length} Buchungen`;

      const totalCostEur = filtered.reduce((sum, b) => {
        const c = parseFloat(b.cost) || 0;
        return sum + (b.currency === 'AUD' ? c * 0.6209 : c);
      }, 0);

      const perPersonEur = Math.round((totalCostEur / 4) * 100) / 100;
      if (costPill) {
        costPill.textContent = `${Math.round(totalCostEur).toLocaleString('de-DE')} € (${perPersonEur.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € p.P.)`;
      }

      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="org-empty-state glass-card" style="grid-column: 1 / -1">
            <i class="fa-solid fa-receipt"></i>
            <h3>Keine Buchungen gefunden</h3>
            <p>Es gibt keine Buchungseinträge für die aktuellen Filterkriterien.</p>
            <button type="button" class="btn-org-action secondary glass-pill" onclick="resetBookingFilters()">
              <i class="fa-solid fa-rotate-left"></i> Filter zurücksetzen
            </button>
          </div>
        `;
        return;
      }

      container.innerHTML = filtered.map(b => {
        const catMeta = ORG_CATEGORY_META[b.category] || { label: b.category, icon: 'fa-ticket', color: 'cat-misc' };
        const statusLabel = b.status === 'confirmed' ? 'Bestätigt' : (b.status === 'pending' ? 'In Planung' : 'Optional');
        const statusClass = b.status === 'confirmed' ? 'status-confirmed' : (b.status === 'pending' ? 'status-pending' : 'status-optional');
        const statusIcon = b.status === 'confirmed' ? 'fa-circle-check' : (b.status === 'pending' ? 'fa-clock' : 'fa-lightbulb');

        const currencySymbol = b.currency === 'AUD' ? 'A$' : '€';
        const costVal = parseFloat(b.totalAmount ?? b.cost ?? b.price) || 0;
        const perPerson = b.perPersonAmount !== undefined ? b.perPersonAmount : Math.round((costVal / 4) * 100) / 100;

        let dateDisplay = b.date || '';
        if (b.date && b.date.includes('-')) {
          const parts = b.date.split('-');
          if (parts.length === 3) dateDisplay = `${parts[2]}.${parts[1]}.${parts[0]}`;
        }
        if (b.time) dateDisplay += (dateDisplay ? ' · ' : '') + b.time + ' Uhr';
        if (!dateDisplay) dateDisplay = 'Vor Reiseantritt';

        return `
          <div class="booking-card" id="booking-card-${b.id}">
            <div>
              <div class="booking-card-top">
                <div class="booking-badge-row">
                  <span class="booking-cat-badge ${catMeta.color}">
                    <i class="fa-solid ${catMeta.icon}"></i> ${catMeta.label}
                  </span>
                  ${b.dayNum > 0 ? `
                    <button type="button" class="booking-day-pill" onclick="jumpToDayAndHighlight(${b.dayNum})" title="Klicken: Zu Tag ${b.dayNum} im Reiseplan springen">
                      <i class="fa-solid fa-calendar-day"></i> Tag ${b.dayNum}
                    </button>
                  ` : `
                    <span class="booking-day-pill" style="cursor:default"><i class="fa-solid fa-earth-oceania"></i> Allgemein</span>
                  `}
                </div>
                <span class="booking-status-pill ${statusClass}">
                  <i class="fa-solid ${statusIcon}"></i> ${statusLabel}
                </span>
              </div>

              <div class="booking-title">${escapeHtml(b.name)}</div>

              ${b.bookingRef ? `
                <div class="booking-ref-box">
                  <div>
                    <div class="booking-ref-label">Buchungs-Ref</div>
                    <div class="booking-ref-code">${escapeHtml(b.bookingRef)}</div>
                  </div>
                  <button type="button" id="copy-btn-${b.id}" class="booking-ref-copy-btn" onclick="copyBookingRef('copy-btn-${b.id}', '${escapeHtml(b.bookingRef)}')" title="Buchungsnummer in Zwischenablage kopieren">
                    <i class="fa-regular fa-copy"></i>
                  </button>
                </div>
              ` : ''}

              <div class="booking-details-grid">
                <div class="booking-detail-item">
                  <span class="booking-detail-label">Datum / Zeit</span>
                  <span class="booking-detail-val"><i class="fa-regular fa-clock" style="font-size:0.75rem"></i> ${escapeHtml(dateDisplay)}</span>
                </div>
                <div class="booking-detail-item">
                  <span class="booking-detail-label">Kosten (4 Pers.)</span>
                  <div>
                    <span class="booking-price-pill">${costVal.toLocaleString('de-DE')} ${currencySymbol}</span>
                    <span class="booking-price-sub">(${perPerson.toLocaleString('de-DE')} ${currencySymbol}/P.)</span>
                  </div>
                </div>
              </div>

              ${b.location ? `
                <div class="booking-detail-item" style="margin-bottom:0.75rem">
                  <span class="booking-detail-label">Ort / Adresse</span>
                  <span class="booking-detail-val" title="${escapeHtml(b.location)}">
                    <i class="fa-solid fa-location-dot" style="font-size:0.75rem"></i> ${escapeHtml(b.location)}
                  </span>
                </div>
              ` : ''}

              ${b.notes ? `
                <div class="booking-notes-box">
                  <i class="fa-solid fa-circle-info" style="margin-right:0.25rem"></i> ${escapeHtml(b.notes)}
                </div>
              ` : ''}
            </div>

            <div class="booking-card-actions">
              <div class="booking-action-btn-group">
                ${b.link ? `
                  <a href="${b.link}" target="_blank" rel="noopener noreferrer" class="booking-card-btn btn-link-ext" title="Voucher / Buchungslink öffnen">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> Voucher
                  </a>
                ` : ''}
                ${b.dayNum > 0 ? `
                  <button type="button" class="booking-card-btn" onclick="jumpToDayAndHighlight(${b.dayNum})" title="Im Reiseplan anzeigen">
                    <i class="fa-solid fa-map-location-dot"></i> Reiseplan
                  </button>
                ` : ''}
              </div>

              <div class="booking-action-btn-group">
                <button type="button" class="booking-card-btn" onclick="openBookingModal('${b.id}')" title="Buchung bearbeiten">
                  <i class="fa-solid fa-pen-to-square"></i> Bearbeiten
                </button>
                <button type="button" class="booking-card-btn btn-danger" id="bkg-del-btn-${b.id}" onclick="confirmOrDeleteBooking('${b.id}', this, event)" title="Buchung löschen">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    function resetBookingFilters() {
      const searchInput = document.getElementById('org-booking-search');
      const catSelect = document.getElementById('org-booking-filter-cat');
      const daySelect = document.getElementById('org-booking-filter-day');
      const sortSelect = document.getElementById('org-booking-sort');
      if (searchInput) searchInput.value = '';
      if (catSelect) catSelect.value = 'all';
      if (daySelect) daySelect.value = 'all';
      if (sortSelect) sortSelect.value = 'day-asc';
      renderBookings();
    }

    function copyBookingRef(btnId, code) {
      if (!code) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(showCopied).catch(fallbackCopy);
      } else {
        fallbackCopy();
      }

      function fallbackCopy() {
        try {
          const ta = document.createElement('textarea');
          ta.value = code;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          showCopied();
        } catch (e) { }
      }

      function showCopied() {
        const btn = document.getElementById(btnId);
        if (!btn) return;
        const origHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check" style=""></i> <span style="font-size:0.75rem; font-weight:700">Kopiert!</span>';
        setTimeout(() => { btn.innerHTML = origHtml; }, 2000);
      }
    }

    function openBookingModal(bookingId) {
      const backdrop = document.getElementById('booking-modal-backdrop');
      const titleEl = document.getElementById('booking-modal-title-text');
      const form = document.getElementById('booking-modal-form');
      const delBtn = document.getElementById('bkg-modal-delete-btn');
      if (!backdrop || !form) return;

      form.reset();
      resetActiveConfirmBtn();

      if (bookingId) {
        const b = userBookings.find(item => String(item.id) === String(bookingId));
        if (b) {
          if (titleEl) titleEl.textContent = 'Buchung bearbeiten';
          document.getElementById('bkg-form-id').value = b.id;
          document.getElementById('bkg-form-cat').value = b.category || 'flights';
          document.getElementById('bkg-form-day').value = b.dayNum !== undefined ? b.dayNum : 0;
          document.getElementById('bkg-form-name').value = b.name || '';
          document.getElementById('bkg-form-provider').value = b.provider || '';
          document.getElementById('bkg-form-ref').value = b.bookingRef || '';
          document.getElementById('bkg-form-date').value = b.date || '';
          document.getElementById('bkg-form-time').value = b.time || '';
          document.getElementById('bkg-form-location').value = b.location || '';
          document.getElementById('bkg-form-cost').value = b.price ?? b.cost ?? '';
          const priceTypeEl = document.getElementById('bkg-form-price-type');
          if (priceTypeEl) priceTypeEl.value = b.priceType || 'total';
          document.getElementById('bkg-form-currency').value = b.currency || 'EUR';
          document.getElementById('bkg-form-status').value = b.status || 'confirmed';
          document.getElementById('bkg-form-link').value = b.link || '';
          document.getElementById('bkg-form-notes').value = b.notes || '';
        }
        if (delBtn) {
          delBtn.style.display = 'inline-flex';
          delBtn.dataset.bookingId = bookingId;
          delBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i> Buchung löschen';
          delBtn.classList.remove('confirm-delete-active');
          delete delBtn.dataset.confirming;
        }
      } else {
        if (titleEl) titleEl.textContent = 'Neue Buchung erfassen';
        document.getElementById('bkg-form-id').value = '';
        document.getElementById('bkg-form-day').value = 0;
        document.getElementById('bkg-form-status').value = 'confirmed';
        document.getElementById('bkg-form-currency').value = 'EUR';
        const priceTypeEl = document.getElementById('bkg-form-price-type');
        if (priceTypeEl) priceTypeEl.value = 'total';
        if (delBtn) {
          delBtn.style.display = 'none';
          delete delBtn.dataset.bookingId;
        }
      }

      backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeBookingModal() {
      resetActiveConfirmBtn();
      const backdrop = document.getElementById('booking-modal-backdrop');
      if (backdrop) backdrop.classList.remove('open');
      document.body.style.overflow = '';
    }

    function saveBookingFromModal(event) {
      if (event) event.preventDefault();

      const id = document.getElementById('bkg-form-id').value.trim();
      const category = document.getElementById('bkg-form-cat').value;
      const dayNum = parseInt(document.getElementById('bkg-form-day').value, 10) || 0;
      const name = document.getElementById('bkg-form-name').value.trim();
      const provider = document.getElementById('bkg-form-provider').value.trim();
      const bookingRef = document.getElementById('bkg-form-ref').value.trim();
      const date = document.getElementById('bkg-form-date').value;
      const time = document.getElementById('bkg-form-time').value;
      const location = document.getElementById('bkg-form-location').value.trim();
      const priceType = document.getElementById('bkg-form-price-type')?.value || 'total';
      const rawCost = parseFloat(document.getElementById('bkg-form-cost').value) || 0;
      const totalAmount = priceType === 'per_person' ? rawCost * 4 : (priceType === 'two_persons' ? rawCost * 2 : rawCost);
      const perPersonAmount = totalAmount / 4;
      const cost = totalAmount;
      const currency = document.getElementById('bkg-form-currency').value || 'EUR';
      const status = document.getElementById('bkg-form-status').value || 'confirmed';
      const link = document.getElementById('bkg-form-link').value.trim();
      const notes = document.getElementById('bkg-form-notes').value.trim();

      if (!name) {
        alert('Bitte gib einen Namen oder Anbieter für die Buchung an.');
        return;
      }

      if (id) {
        // Bearbeiten
        const idx = userBookings.findIndex(b => String(b.id) === String(id));
        if (idx !== -1) {
          userBookings[idx] = {
            ...userBookings[idx],
            category, dayNum, name, provider, bookingRef, date, time, location, price: rawCost, priceType, cost, totalAmount, perPersonAmount, currency, status, link, notes
          };
        }
      } else {
        // Neu anlegen
        const newBooking = {
          id: 'bkg-custom-' + Date.now(),
          category, dayNum, name, provider, bookingRef, date, time, location, price: rawCost, priceType, cost, totalAmount, perPersonAmount, currency, status, link, notes
        };
        userBookings.unshift(newBooking);
      }

      if (!saveUserBookings()) return;
      renderBookings();
      closeBookingModal();
    }

    // -------------------------------------------------------------------------
    // ZWEI-STUFEN LÖSCH-LOGIK (FAIL-SAFE OHNE BLOCKIERTE WINDOW.CONFIRM POPUPS)
    // -------------------------------------------------------------------------
    let activeConfirmBtn = null;
    let activeConfirmTimeout = null;

    function resetActiveConfirmBtn() {
      if (activeConfirmBtn) {
        if (activeConfirmBtn._origHtml) {
          activeConfirmBtn.innerHTML = activeConfirmBtn._origHtml;
        }
        activeConfirmBtn.classList.remove('confirm-delete-active');
        delete activeConfirmBtn.dataset.confirming;
        activeConfirmBtn = null;
      }
      if (activeConfirmTimeout) {
        clearTimeout(activeConfirmTimeout);
        activeConfirmTimeout = null;
      }
    }

    function confirmOrDeleteBooking(bookingId, btn, evt) {
      if (evt) {
        evt.stopPropagation();
        evt.preventDefault();
      }
      if (!btn) {
        deleteBooking(bookingId, false);
        return;
      }

      if (btn.dataset.confirming === 'true') {
        resetActiveConfirmBtn();
        deleteBooking(bookingId, true);
        return;
      }

      resetActiveConfirmBtn();
      btn.dataset.confirming = 'true';
      btn._origHtml = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Wirklich löschen?';
      btn.classList.add('confirm-delete-active');
      activeConfirmBtn = btn;

      activeConfirmTimeout = setTimeout(() => {
        resetActiveConfirmBtn();
      }, 4500);
    }

    function confirmOrDeleteBookingFromModal(btn) {
      const id = document.getElementById('bkg-form-id').value.trim() || (btn && btn.dataset.bookingId);
      if (!id) return;

      if (btn && btn.dataset.confirming === 'true') {
        resetActiveConfirmBtn();
        closeBookingModal();
        deleteBooking(id, true);
        return;
      }

      if (btn) {
        btn.dataset.confirming = 'true';
        btn._origHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Wirklich löschen?';
        btn.classList.add('confirm-delete-active');
        activeConfirmBtn = btn;
        activeConfirmTimeout = setTimeout(() => {
          resetActiveConfirmBtn();
        }, 4500);
      } else {
        closeBookingModal();
        deleteBooking(id, false);
      }
    }

    function deleteBookingFromModal() {
      const delBtn = document.getElementById('bkg-modal-delete-btn');
      confirmOrDeleteBookingFromModal(delBtn);
    }

    function deleteBooking(bookingId, skipConfirm = false) {
      if (!bookingId) return;
      const strId = String(bookingId);
      const b = userBookings.find(item => String(item.id) === strId);
      const bName = b ? b.name : 'diese Buchung';

      if (!skipConfirm) {
        let confirmed = false;
        try {
          confirmed = window.confirm(`Möchtest du "${bName}" wirklich unwiderruflich löschen?`);
        } catch (e) {
          confirmed = true;
        }
        if (!confirmed) return;
      }

      userBookings = userBookings.filter(item => String(item.id) !== strId);
      if (!saveUserBookings()) return;
      renderBookings();
      if (typeof updateCockpitData === 'function') {
        try { updateCockpitData(); } catch (e) { }
      }
    }

    function openBookingsForDay(dayNum) {
      showView('organisation');
      const sec = document.getElementById('organization');
      if (sec) {
        switchOrgTab('bookings');
        const daySelect = document.getElementById('org-booking-filter-day');
        if (daySelect) {
          daySelect.value = String(dayNum);
          renderBookings();
        }
        sec.scrollIntoView({ behavior: 'smooth' });
      }
    }

    // -------------------------------------------------------------------------
    // PACKLISTE LOGIK
    // -------------------------------------------------------------------------
    const PACKING_CATEGORIES = [
      { key: 'docs', label: 'Dokumente', icon: 'fa-passport' },
      { key: 'tech', label: 'Technik', icon: 'fa-plug' },
      { key: 'camera', label: 'Kamera', icon: 'fa-camera' },
      { key: 'drone', label: 'Drohne', icon: 'fa-paper-plane' },
      { key: 'clothing', label: 'Kleidung', icon: 'fa-shirt' },
      { key: 'hygiene', label: 'Hygiene', icon: 'fa-pump-soap' },
      { key: 'meds', label: 'Medikamente', icon: 'fa-kit-medical' },
      { key: 'car', label: 'Auto & Roadtrip', icon: 'fa-car-side' },
      { key: 'camping', label: 'Camping & Strand', icon: 'fa-umbrella-beach' },
      { key: 'misc', label: 'Sonstiges', icon: 'fa-suitcase' }
    ];

    function getFilteredPackingItems() {
      const query = currentPackingQuery.trim().toLocaleLowerCase('de-AT');
      return userPacking.filter(item =>
        (currentPackingCatFilter === 'all' || item.category === currentPackingCatFilter) &&
        (currentPackingStatus === 'all' || (currentPackingStatus === 'packed') === !!item.packed) &&
        [item.name, item.quantity, item.note, PACKING_CATEGORIES.find(cat => cat.key === item.category)?.label]
          .join(' ').toLocaleLowerCase('de-AT').includes(query));
    }

    function renderPackingList(preserveControls = false) {
      const U = window.ManagementUI;
      const list = document.getElementById('org-packing-list-container');
      if (!list || !U) return;
      const total = userPacking.length, packed = userPacking.filter(item => item.packed).length;
      const percentage = total ? Math.round(packed / total * 100) : 0;
      const fill = document.getElementById('org-packing-progress-fill');
      if (fill) { fill.style.width = percentage + '%'; fill.parentElement.setAttribute('aria-valuenow', String(percentage)); }
      const progressText = document.getElementById('org-packing-pct-text');
      if (progressText) progressText.textContent = `${packed} / ${total} (${percentage}%)`;
      const progressBadge = document.getElementById('org-badge-packing-progress');
      if (progressBadge) progressBadge.textContent = `${packed}/${total} · ${percentage}%`;
      const status = document.getElementById('org-packing-status-badge');
      if (status) {
        status.className = 'glass-pill' + (total && packed === total ? ' complete' : '');
        status.textContent = packed === total && total ? 'Abflugbereit' : packed ? 'Packen begonnen' : 'Koffer noch leer';
      }
      const controls = document.getElementById('org-packing-chips-container');
      if (!preserveControls && controls) controls.innerHTML = U.filters('packing',
        Object.fromEntries(PACKING_CATEGORIES.map(cat => [cat.key, cat.label])), currentPackingCatFilter, currentPackingQuery, currentPackingStatus);
      const items = getFilteredPackingItems();
      list.innerHTML = items.length ? `<div class="glass-list">${PACKING_CATEGORIES.map(cat => {
        const group = items.filter(item => item.category === cat.key);
        if (!group.length) return '';
        return `<h3 class="glass-group-title" id="packing-cat-sec-${cat.key}">${escapeHtml(cat.label)}</h3>` + group.map(item => {
          const id = escapeHtml(item.id), name = escapeHtml(item.name);
          const link = item.link && /^(?:#[a-zA-Z0-9/-]+|https?:\/\/)/.test(item.link)
            ? `<a class="glass-pill" href="${escapeHtml(item.link)}" onclick="${item.link === '#organization' ? "event.preventDefault(); switchOrgTab('bookings');" : ''}">${escapeHtml(item.linkLabel || 'Link')}</a>` : '';
          return U.row({id:'packing-row-' + item.id, title:item.name, subtitle:[cat.label,item.quantity,item.note].filter(Boolean).join(' · '),
            icon:cat.icon, interactive:false, tail:`<span class="glass-pill ${item.packed?'complete':''}">${item.packed?'Gepackt':'Noch offen'}</span><label class="glass-switch"><input type="checkbox" id="pack-cb-${id}" aria-label="${name} gepackt" ${item.packed?'checked':''} data-packing-toggle="${id}"><span class="glass-switch-track" aria-hidden="true"></span></label>${link}<button type="button" class="glass-icon-button" id="pack-del-btn-${id}" data-packing-delete="${id}" aria-label="${name} löschen"><i class="fa-solid fa-trash-can" aria-hidden="true"></i></button>`});
        }).join('');
      }).join('')}</div>` : `<div class="glass-card glass-empty"><span class="glass-eyebrow">RAUM FÜR DEINE PLÄNE</span><h3>Keine passenden Einträge.</h3><p>Passe deine Suche oder Filter an.</p><button type="button" class="glass-pill glass-action-primary" data-packing-reset>Filter zurücksetzen</button></div>`;
    }
    document.addEventListener('input', event => {
      if (event.target.dataset.search !== 'packing') return;
      currentPackingQuery = event.target.value;
      renderPackingList(true);
    });
    document.addEventListener('change', event => {
      if (event.target.dataset.statusFilter === 'packing') { currentPackingStatus = event.target.value; renderPackingList(); }
      if (event.target.dataset.packingToggle) {
        const id = event.target.dataset.packingToggle;
        togglePackingItem(id, event.target.checked);
        document.getElementById('pack-cb-' + id)?.focus();
      }
    });
    document.addEventListener('click', event => {
      const del = event.target.closest('[data-packing-delete]');
      if (del) confirmOrDeletePacking(del.dataset.packingDelete, del, event);
      if (event.target.closest('[data-packing-reset]')) {
        currentPackingCatFilter = 'all'; currentPackingQuery = ''; currentPackingStatus = 'all'; renderPackingList();
      }
    });

    function togglePackingItem(itemId, isChecked) {
      const item = userPacking.find(p => p.id === itemId);
      if (!item) return;
      item.packed = !!isChecked;
      if (!saveUserPacking()) return;
      renderPackingList();
    }

    function filterPackingByCategory(catKey) {
      currentPackingCatFilter = catKey;
      renderPackingList();
    }

    function openPackingModal() {
      const backdrop = document.getElementById('packing-modal-backdrop');
      const form = document.getElementById('packing-modal-form');
      if (!backdrop || !form) return;
      form.reset();
      if (currentPackingCatFilter !== 'all') {
        const catSelect = document.getElementById('pack-form-cat');
        if (catSelect) catSelect.value = currentPackingCatFilter;
      }
      backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closePackingModal() {
      const backdrop = document.getElementById('packing-modal-backdrop');
      if (backdrop) backdrop.classList.remove('open');
      document.body.style.overflow = '';
    }

    function savePackingItemFromModal(event) {
      if (event) event.preventDefault();

      const name = document.getElementById('pack-form-name').value.trim();
      const category = document.getElementById('pack-form-cat').value;
      const quantity = document.getElementById('pack-form-qty').value.trim();
      const note = document.getElementById('pack-form-note').value.trim();

      if (!name) {
        alert('Bitte gib eine Bezeichnung für den Pack-Artikel an.');
        return;
      }

      const newItem = {
        id: 'pack-custom-' + Date.now(),
        category,
        name,
        quantity: quantity || '1x',
        note: note || '',
        packed: false,
        isCustom: true
      };

      userPacking.unshift(newItem);
      if (!saveUserPacking()) return;
      renderPackingList();
      closePackingModal();
    }

    function confirmOrDeletePacking(itemId, btn, evt) {
      if (evt) {
        evt.stopPropagation();
        evt.preventDefault();
      }
      if (!btn) {
        deletePackingItem(itemId, false);
        return;
      }

      if (btn.dataset.confirming === 'true') {
        resetActiveConfirmBtn();
        deletePackingItem(itemId, true);
        return;
      }

      resetActiveConfirmBtn();
      btn.dataset.confirming = 'true';
      btn._origHtml = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Löschen?';
      btn.classList.add('confirm-delete-active');
      activeConfirmBtn = btn;

      activeConfirmTimeout = setTimeout(() => {
        resetActiveConfirmBtn();
      }, 4500);
    }

    function deletePackingItem(itemId, skipConfirm = false) {
      if (!itemId) return;
      const strId = String(itemId);
      const item = userPacking.find(p => String(p.id) === strId);
      const name = item ? item.name : 'diesen Artikel';

      if (!skipConfirm) {
        let confirmed = false;
        try {
          confirmed = window.confirm(`Möchtest du "${name}" von der Packliste entfernen?`);
        } catch (e) {
          confirmed = true;
        }
        if (!confirmed) return;
      }

      userPacking = userPacking.filter(p => String(p.id) !== strId);
      if (!saveUserPacking()) return;
      renderPackingList();
    }

    function checkAllPackingList() {
      const targetItems = getFilteredPackingItems();

      targetItems.forEach(p => p.packed = true);
      if (!saveUserPacking()) return;
      renderPackingList();
    }

    function resetPackingList() {
      const targetDesc = 'die angezeigten Artikel';
      if (!confirm(`Möchtest du ${targetDesc} wirklich als unbepackt zurücksetzen?`)) return;

      const targetItems = getFilteredPackingItems();

      targetItems.forEach(p => p.packed = false);
      if (!saveUserPacking()) return;
      renderPackingList();
    }

    function restoreDefaultPackingList() {
      if (!confirm('Möchtest du die Packliste auf den vollständigen australischen 55-Artikel-Standard zurücksetzen? Eigene Änderungen gehen dabei verloren.')) return;
      userPacking = JSON.parse(JSON.stringify(DEFAULT_PACKING_ITEMS));
      if (!saveUserPacking()) return;
      currentPackingCatFilter = 'all';
      renderPackingList();
    }

    function openPackingList(cat) {
      showView('organisation');
      const sec = document.getElementById('organization');
      if (sec) {
        switchOrgTab('packing');
        if (cat) filterPackingByCategory(cat);
        sec.scrollIntoView({ behavior: 'smooth' });
      }
    }

    function initOrganization() {
      loadUserBookings();
      loadUserPacking();
      renderBookings();
      renderPackingList();
      initJournalAndPhotos();
      initGlobalSearch();
    }

    // Compatibility entry points for routes, search and existing day links.
    function renderJournalDays() { window.JournalUpload?.render(); }
    function renderPhotosGallery() { window.JournalUpload?.render(); }
    function selectJournalDay(day) { window.JournalUpload?.selectDay(day); }
    function jumpToJournalDay(day) {
      showView('erlebnisse'); switchExpTab('journal'); selectJournalDay(day);
      document.getElementById('journal')?.scrollIntoView({behavior:'smooth',block:'start'});
    }

    // =========================================================================
    // AUFGABE 4/5 – TEIL C: GLOBALE SUCHE (COMMAND PALETTE)
    // =========================================================================
    let globalSearchIndex = [];
    let currentSearchCategory = 'all';
    let searchDebounceTimer = null;
    let activeSearchIndex = -1;

    function buildGlobalSearchIndex() {
      const index = [];

      // 1. Reisetage (1–20)
      if (Array.isArray(TRIP_DAYS_DATA)) {
        TRIP_DAYS_DATA.forEach(d => {
          index.push({
            id: `day-${d.day}`,
            cat: 'days',
            catLabel: 'Reisetag',
            icon: 'fa-calendar-day',
            iconClass: 'icon-days',
            title: `Tag ${d.day}: ${d.title}`,
            subtitle: `${d.date} · ${d.location} · ${d.distance}`,
            keywords: `${d.start} ${d.destination} ${d.driveTime} ${d.transportType} ${d.accommodation} ${d.activities.join(' ')}`,
            action: () => {
              jumpToDayAndHighlight(d.day);
              const target = document.getElementById('day-' + d.day) || document.getElementById('trip-day-' + d.day);
              if (target) target.scrollIntoView({ behavior: 'smooth' });
            }
          });
        });
      }

      // 2. Orte & Routen-Highlights
      const placesMap = [
        { name: 'Sydney & Hafen', desc: 'NSW · Tag 1–4 · Oper, Harbour Bridge, Manly, Bondi', day: 2 },
        { name: 'Byron Bay & Cape Byron', desc: 'NSW · Tag 5–7 · Östlichster Punkt, Leuchtturm, Surfen', day: 6 },
        { name: 'Brisbane & South Bank', desc: 'QLD · Tag 7–9 · Stadtstrand, Kangaroo Point, Kultur', day: 8 },
        { name: 'Beerwah (Australia Zoo)', desc: 'QLD · Tag 9 · Steve Irwin Wildlife Hospital & Krokodil-Show', day: 9 },
        { name: 'Noosa Heads & Nationalpark', desc: 'QLD · Tag 10 · Coastal Track, Koalas, Fairy Pools', day: 10 },
        { name: 'Rainbow Beach & Carlo Sand Blow', desc: 'QLD · Tag 11 · Riesige Sanddüne & Farbiger Sand', day: 11 },
        { name: 'Hervey Bay', desc: 'QLD · Tag 11–12 · Tor zu Fraser Island', day: 11 },
        { name: 'K’gari (Fraser Island)', desc: 'QLD · Tag 12 · Lake McKenzie, 75 Mile Beach, 4WD Abenteuer', day: 12 },
        { name: 'Airlie Beach & Whitsundays', desc: 'QLD · Tag 13–15 · Great Barrier Reef, Camira Katamaran', day: 14 },
        { name: 'Whitehaven Beach & Hill Inlet', desc: 'QLD · Tag 14 · Schneeweißer Quarzsand & Türkisblaues Wasser', day: 14 },
        { name: 'Heart Reef (Whitsundays)', desc: 'QLD · Tag 15 · Helikopterflug über das Herz-Korallenriff', day: 15 },
        { name: 'Melbourne & Laneways', desc: 'VIC · Tag 16–20 · Hosier Lane, Street Art, Kaffeekultur', day: 17 },
        { name: 'St. Kilda Pier', desc: 'Melbourne VIC · Tag 17 · Zwergpinguine bei Sonnenuntergang', day: 17 },
        { name: 'Great Ocean Road & Twelve Apostles', desc: 'VIC · Tag 18 · Loch Ard Gorge, Kalksteinfelsen, Koalas', day: 18 }
      ];
      placesMap.forEach(p => {
        index.push({
          id: `place-${p.name}`,
          cat: 'places',
          catLabel: 'Ort & Spot',
          icon: 'fa-location-dot',
          iconClass: 'icon-places',
          title: p.name,
          subtitle: p.desc,
          keywords: `${p.name} ${p.desc}`,
          action: () => {
            if (typeof focusDayOnMap === 'function') focusDayOnMap(p.day);
            jumpToDayAndHighlight(p.day);
            const target = document.getElementById('day-' + p.day) || document.getElementById('trip-day-' + p.day);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });

      // 3. Aktivitäten & Erlebnisse
      if (Array.isArray(TRIP_DAYS_DATA)) {
        TRIP_DAYS_DATA.forEach(d => {
          if (Array.isArray(d.activities)) {
            d.activities.forEach((act, actIdx) => {
              index.push({
                id: `act-${d.day}-${actIdx}`,
                cat: 'activities',
                catLabel: 'Aktivität',
                icon: 'fa-person-hiking',
                iconClass: 'icon-activities',
                title: act,
                subtitle: `Tag ${d.day} (${d.date}) · ${d.location}`,
                keywords: `${act} ${d.title} ${d.location}`,
                action: () => {
                  jumpToDayAndHighlight(d.day);
                  const target = document.getElementById('day-' + d.day) || document.getElementById('trip-day-' + d.day);
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }
              });
            });
          }
        });
      }

      // 4. Buchungen & Voucher
      if (Array.isArray(userBookings)) {
        userBookings.forEach(b => {
          index.push({
            id: `bkg-${b.id}`,
            cat: 'bookings',
            catLabel: 'Buchung',
            icon: 'fa-ticket',
            iconClass: 'icon-bookings',
            title: b.name,
            subtitle: `${b.provider || ''} ${b.bookingRef ? '· Ref: ' + b.bookingRef : ''} · ${b.cost ? b.cost + ' ' + (b.currency || 'EUR') : ''}`,
            keywords: `${b.name} ${b.provider || ''} ${b.bookingRef || ''} ${b.location || ''} ${b.notes || ''} ${b.category || ''}`,
            action: () => {
              openBookingsForDay(b.dayNum || 0);
              const target = document.getElementById('booking-card-' + b.id) || document.getElementById('manage-bookings') || document.getElementById('organization');
              if (target) target.scrollIntoView({ behavior: 'smooth' });
            }
          });
        });
      }

      // 5. Unterkünfte
      const hotels = [
        { name: 'The Ultimo Sydney', loc: 'Sydney (Chinatown)', day: 2, desc: 'Tage 2–4 · 3 Nächte · Ref: ULT-849201' },
        { name: 'AirBnB East Ballina', loc: 'Ballina / Byron Bay', day: 5, desc: 'Tage 5–6 · 2 Nächte · Ref: HM9284KLM' },
        { name: 'Rambla at Story House', loc: 'Brisbane (Kangaroo Point)', day: 7, desc: 'Tage 7–9 · 3 Nächte · Ref: RAM-391024' },
        { name: 'Villa Noosa Hotel', loc: 'Noosaville / Sunshine Coast', day: 10, desc: 'Tag 10 · 1 Nacht · Ref: VN-58291' },
        { name: 'Nightcap at Kondari Resort', loc: 'Hervey Bay / Urangan', day: 11, desc: 'Tag 11 · 1 Nacht · Ref: NC-71249' },
        { name: 'Coral Sea Vista Apartments', loc: 'Airlie Beach / Whitsundays', day: 13, desc: 'Tage 13–15 · 3 Nächte · Ref: BKG-CS-99120' },
        { name: 'Vibe Hotel Melbourne Docklands', loc: 'Melbourne CBD / Docklands', day: 16, desc: 'Tage 16–19 · 4 Nächte · Ref: VIB-MEL-40291' }
      ];
      hotels.forEach(h => {
        index.push({
          id: `hotel-${h.name}`,
          cat: 'hotels',
          catLabel: 'Unterkunft',
          icon: 'fa-hotel',
          iconClass: 'icon-hotels',
          title: h.name,
          subtitle: `${h.loc} · ${h.desc}`,
          keywords: `${h.name} ${h.loc} ${h.desc} hotel accommodation unterkunft`,
          action: () => {
            const hotelName = h.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            const booking = window.ManagementPage?.repo?.get('booking').find(b => b.title.toLowerCase().replace(/[^a-z0-9]/g, '').includes(hotelName));
            if (booking) window.ManagementPage.openEntity('booking', booking.id);
            else openBookingsForDay(h.day);
            const target = document.getElementById('manage-editor') || document.getElementById('organization');
            if (target) target.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });

      index.push(...(window.JournalUpload?.searchIndex() || []));

      // 7. Packliste
      if (Array.isArray(userPacking)) {
        userPacking.forEach(p => {
          const isDoc = p.category === 'docs';
          index.push({
            id: `pack-${p.id}`,
            cat: isDoc ? 'docs' : 'packing',
            catLabel: isDoc ? 'Dokument' : 'Packliste',
            icon: isDoc ? 'fa-shield-halved' : 'fa-suitcase',
            iconClass: isDoc ? 'icon-docs' : 'icon-packing',
            title: p.name,
            subtitle: `${p.quantity || '1x'} · ${p.note ? p.note : (isDoc ? 'Reisedokument' : 'Pack-Gegenstand')}`,
            keywords: `${p.name} ${p.note || ''} ${p.category || ''}`,
            action: () => {
              openPackingList(p.category);
              const target = document.getElementById('org-tab-content-packing') || document.getElementById('organization');
              const row = document.getElementById('packing-row-' + p.id);
              if (row || target) (row || target).scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          });
        });
      }

      globalSearchIndex = window.ManagementPage?.repo ? [...index.filter(x => !['days','activities','bookings','expenses','drone'].includes(x.cat)), ...window.ManagementPage.searchIndex()] : index;
      return index;
    }

    function openGlobalSearch() {
      if (document.body.classList.contains('is-locked')) return;
      const modal = document.getElementById('global-search-modal');
      const input = document.getElementById('global-search-input');
      if (!modal || !input) return;

      buildGlobalSearchIndex();
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';

      input.value = '';
      currentSearchCategory = 'all';
      updateSearchCategoryChips();
      renderSearchResults([]);
      setTimeout(() => input.focus(), 60);
    }

    function closeGlobalSearch() {
      const modal = document.getElementById('global-search-modal');
      if (modal) modal.style.display = 'none';
      document.body.style.overflow = '';
      activeSearchIndex = -1;
    }

    function clearGlobalSearch() {
      const input = document.getElementById('global-search-input');
      const clearBtn = document.getElementById('search-clear-btn');
      if (input) {
        input.value = '';
        input.focus();
      }
      if (clearBtn) clearBtn.style.display = 'none';
      renderSearchResults([]);
    }

    function filterSearchByCategory(catKey) {
      currentSearchCategory = catKey;
      updateSearchCategoryChips();
      const input = document.getElementById('global-search-input');
      if (input) onGlobalSearchInput(input.value);
    }

    function updateSearchCategoryChips() {
      document.querySelectorAll('#search-category-chips .search-chip').forEach(chip => {
        if (chip.getAttribute('data-cat') === currentSearchCategory) {
          chip.classList.add('active');
        } else {
          chip.classList.remove('active');
        }
      });
    }

    function onGlobalSearchInput(val) {
      const clearBtn = document.getElementById('search-clear-btn');
      if (clearBtn) clearBtn.style.display = val ? 'flex' : 'none';

      if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        searchDebounceTimer = null;
        performGlobalSearch(val);
      }, 120);
    }

    function performGlobalSearch(query) {
      const clean = (query || '').trim().toLowerCase();
      if (!clean) {
        renderSearchResults([]);
        return;
      }

      let pool = globalSearchIndex;
      if (currentSearchCategory !== 'all') {
        pool = pool.filter(item => item.cat === currentSearchCategory);
      }

      const tokens = clean.split(/\s+/).filter(Boolean);

      const matches = [];
      pool.forEach(item => {
        const titleLower = item.title.toLowerCase();
        const subLower = item.subtitle.toLowerCase();
        const kwLower = item.keywords.toLowerCase();

        let matchCount = 0;
        let score = 0;

        for (const token of tokens) {
          if (titleLower.includes(token)) {
            matchCount++;
            score += 10;
            if (titleLower.startsWith(token)) score += 5;
          } else if (subLower.includes(token)) {
            matchCount++;
            score += 5;
          } else if (kwLower.includes(token)) {
            matchCount++;
            score += 2;
          }
        }

        if (matchCount === tokens.length) {
          matches.push({ item, score });
        }
      });

      matches.sort((a, b) => b.score - a.score);
      renderSearchResults(matches.map(m => m.item), clean);
    }

    let currentRenderedSearchResults = [];

    function renderSearchResults(results, queryStr = '') {
      currentRenderedSearchResults = results;
      activeSearchIndex = -1;

      const container = document.getElementById('global-search-results');
      const metaBar = document.getElementById('search-meta-bar');
      const countEl = document.getElementById('search-result-count');
      if (!container) return;

      if (!queryStr) {
        if (metaBar) metaBar.style.display = 'none';
        container.innerHTML = `
          <div class="search-empty-state">
            <div class="search-empty-icon"><i class="fa-solid fa-magnifying-glass"></i></div>
            <div class="search-empty-title">Was suchst du im Roadtrip-Reiseplan?</div>
            <p style="font-size:0.84rem; margin:0 0 1rem 0">Tippe nach Tagen, Städten, Aktivitäten, Flügen, Hotels, Journal oder Packliste:</p>
            <div class="search-empty-tips">
              <button type="button" class="search-tip-btn" onclick="executeQuickSearch('Sydney')">📍 Sydney</button>
              <button type="button" class="search-tip-btn" onclick="executeQuickSearch('Whitsundays')">🏝️ Whitsundays</button>
              <button type="button" class="search-tip-btn" onclick="executeQuickSearch('Great Ocean Road')">🌊 Great Ocean Road</button>
              <button type="button" class="search-tip-btn" onclick="executeQuickSearch('K’gari')">🚗 K’gari Fraser Island</button>
              <button type="button" class="search-tip-btn" onclick="executeQuickSearch('Mietwagen')">🚙 Mietwagen</button>
              <button type="button" class="search-tip-btn" onclick="executeQuickSearch('Flug')">✈️ Flüge</button>
              <button type="button" class="search-tip-btn" onclick="executeQuickSearch('Reisepass')">📄 Reisepass</button>
              <button type="button" class="search-tip-btn" onclick="executeQuickSearch('Drohne')">🚁 Drohnen</button>
            </div>
          </div>
        `;
        return;
      }

      if (results.length === 0) {
        if (metaBar) metaBar.style.display = 'none';
        container.innerHTML = `
          <div class="search-empty-state">
            <div class="search-empty-icon"><i class="fa-solid fa-triangle-exclamation" style=""></i></div>
            <div class="search-empty-title">Keine Treffer für "${escapeHtml(queryStr)}"</div>
            <p style="font-size:0.84rem; margin:0 0 1rem 0">Überprüfe die Schreibweise oder wähle "Alle Treffer", um alle Kategorien zu durchsuchen.</p>
            <div class="search-empty-tips">
              <button type="button" class="search-tip-btn" onclick="filterSearchByCategory('all')">Alle Kategorien aktivieren</button>
              <button type="button" class="search-tip-btn" onclick="executeQuickSearch('Tag')">Alle Reisetage</button>
            </div>
          </div>
        `;
        return;
      }

      if (metaBar && countEl) {
        metaBar.style.display = 'flex';
        countEl.textContent = `${results.length} Treffer`;
      }

      container.innerHTML = results.map((item, idx) => {
        const highlightedTitle = highlightSearchTerm(item.title, queryStr);
        return `
          <div class="search-result-item" id="search-item-${idx}" onclick="executeSearchResult(${idx}, event)" role="option" aria-selected="false">
            <div class="search-result-icon ${item.iconClass || ''}">
              <i class="fa-solid ${item.icon || 'fa-circle-dot'}"></i>
            </div>
            <div class="search-result-content">
              <div class="search-result-title-row">
                <span class="search-result-title">${highlightedTitle}</span>
                <span class="search-result-badge">${item.catLabel}</span>
              </div>
              <div class="search-result-subtitle">${escapeHtml(item.subtitle)}</div>
            </div>
            <div class="search-result-arrow">
              <i class="fa-solid fa-arrow-right"></i>
            </div>
          </div>
        `;
      }).join('');
    }

    function highlightSearchTerm(text, query) {
      if (!query) return escapeHtml(text);
      const safeText = escapeHtml(text);
      const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
      let res = safeText;
      terms.forEach(t => {
        const regex = new RegExp(`(${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        res = res.replace(regex, '<mark>$1</mark>');
      });
      return res;
    }

    function executeQuickSearch(term) {
      const input = document.getElementById('global-search-input');
      if (input) {
        input.value = term;
        onGlobalSearchInput(term);
      }
    }

    function executeSearchResult(index, event) {
      if (event) {
        if (typeof event.preventDefault === 'function') event.preventDefault();
        if (typeof event.stopPropagation === 'function') event.stopPropagation();
      }
      const item = currentRenderedSearchResults[index];
      if (!item) return;

      closeGlobalSearch();

      if (typeof item.action === 'function') {
        try {
          item.action();
        } catch (err) {
          console.error('Fehler beim Ausführen der Suchaktion:', err);
        }
      }
    }

    function onGlobalSearchKeydown(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (searchDebounceTimer) {
          clearTimeout(searchDebounceTimer);
          searchDebounceTimer = null;
          performGlobalSearch(document.getElementById('global-search-input')?.value || '');
        }
      }
      if (!currentRenderedSearchResults || currentRenderedSearchResults.length === 0) {
        if (event.key === 'Escape') closeGlobalSearch();
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        activeSearchIndex = (activeSearchIndex + 1) % currentRenderedSearchResults.length;
        updateSelectedSearchResult();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        activeSearchIndex = (activeSearchIndex - 1 + currentRenderedSearchResults.length) % currentRenderedSearchResults.length;
        updateSelectedSearchResult();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (activeSearchIndex >= 0 && activeSearchIndex < currentRenderedSearchResults.length) {
          executeSearchResult(activeSearchIndex, event);
        } else if (currentRenderedSearchResults.length > 0) {
          executeSearchResult(0, event);
        }
      } else if (event.key === 'Escape') {
        closeGlobalSearch();
      }
    }

    function updateSelectedSearchResult() {
      document.querySelectorAll('.search-result-item').forEach((el, idx) => {
        if (idx === activeSearchIndex) {
          el.classList.add('is-selected');
          el.setAttribute('aria-selected', 'true');
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          el.classList.remove('is-selected');
          el.setAttribute('aria-selected', 'false');
        }
      });
    }

    window.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      const isInputFocused = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select' || (document.activeElement && document.activeElement.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openGlobalSearch();
        return;
      }

      if (e.key === '/' && !isInputFocused) {
        e.preventDefault();
        openGlobalSearch();
        return;
      }

      if (e.key === 'Escape') {
        const searchModal = document.getElementById('global-search-modal');
        if (searchModal && searchModal.style.display !== 'none') {
          closeGlobalSearch();
          return;
        }
      }
    });

    function initJournalAndPhotos() { window.JournalUpload?.render(); }

    function initGlobalSearch() {
      buildGlobalSearchIndex();
      const form = document.getElementById('global-search-form');
      if (form) {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          if (activeSearchIndex >= 0 && activeSearchIndex < (currentRenderedSearchResults?.length || 0)) {
            executeSearchResult(activeSearchIndex, e);
          } else if ((currentRenderedSearchResults?.length || 0) > 0) {
            executeSearchResult(0, e);
          }
        });
      }
    }

    // =========================================================================
    // FLOATING DROPDOWN MENÜ (BOTTOM-RIGHT) CONTROLLER
    // =========================================================================
    function toggleFloatingDropdown(force) {
      const menu = document.getElementById('floating-nav-menu');
      const btn = document.getElementById('floating-nav-btn');
      const backdrop = document.getElementById('floating-dropdown-backdrop');
      const icon = document.getElementById('floating-btn-icon');
      if (!menu || !btn) return;

      const isOpen = menu.classList.contains('is-open');
      const nextState = force !== undefined ? force : !isOpen;

      if (nextState) {
        menu.classList.add('is-open');
        btn.classList.add('is-active');
        if (backdrop) backdrop.classList.add('is-open');
        if (icon) {
          icon.classList.remove('fa-compass');
          icon.classList.add('fa-xmark');
        }
      } else {
        menu.classList.remove('is-open');
        btn.classList.remove('is-active');
        if (backdrop) backdrop.classList.remove('is-open');
        if (icon) {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-compass');
        }
      }
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') toggleFloatingDropdown(false);
    }, { passive: true });

    document.addEventListener('click', (e) => {
      if (activeConfirmBtn && !activeConfirmBtn.contains(e.target)) {
        resetActiveConfirmBtn();
      }
    });



// =========================================================================
// VIEW ROUTER & REDESIGN NAVIGATION CONTROLLER (6 HAUPTBEREICHE)
// =========================================================================

function showView(viewName, skipHistory) {
  const validViews = ['dashboard', 'reise', 'organisation', 'finanzen', 'erlebnisse', 'mehr'];

  const aliasMap = {
    'home': 'dashboard',
    'route': 'reise',
    'map': 'reise',
    'budget': 'finanzen',
    'organization': 'organisation',
    'journal': 'erlebnisse',
    'photos': 'erlebnisse',
    'taste': 'erlebnisse',
    'drone-hub': 'mehr',
    'drone': 'mehr',
    'weather': 'mehr',
    'emergency': 'mehr',
    'playlist': 'mehr',
    'hub': 'mehr',
    'tools': 'mehr'
  };

  const target = aliasMap[viewName] || (validViews.includes(viewName) ? viewName : 'dashboard');

  // Hide all views, activate target
  document.querySelectorAll('.app-view').forEach(v => {
    const active = v.id === 'view-' + target;
    v.classList.toggle('active', active);
    v.style.display = active ? 'block' : 'none';
  });
  const viewEl = document.getElementById('view-' + target);
  if (viewEl) {
    viewEl.classList.add('active');
  }

  // Update desktop navigation
  document.querySelectorAll('.desktop-nav .nav-tab, .dock-pill[data-view]').forEach(tab => {
    const active = tab.getAttribute('data-view') === target;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });

  // Update mobile bottom navigation (5-item layout: when viewing erlebnisse, highlight mehr)
  document.querySelectorAll('.mobile-bottom-nav .bottom-nav-item').forEach(item => {
    const itemView = item.getAttribute('data-view');
    const isActive = (itemView === target) || (target === 'erlebnisse' && itemView === 'mehr');
    item.classList.toggle('active', isActive);
    item.setAttribute('aria-selected', String(isActive));
  });

  // Trigger view hooks
  if (target === 'reise') {
    ensureRouteMapReady(true);
    setTimeout(() => {
      if (routeInteractiveMap) {
        routeInteractiveMap.invalidateSize({ pan: false });
      }
    }, 120);
    const hash = window.location.hash;
    const dayMatch = hash.match(/#(?:day|tag)-(\d+)/i);
    if (dayMatch) {
      setTimeout(() => jumpToDay(parseInt(dayMatch[1], 10)), 150);
    }
  } else if (target === 'finanzen') {
    setTimeout(() => {
      renderCurrentBudgetChart();
      updateBudgetCalculations();
    }, 100);
  } else if (target === 'organisation') {
    renderBookings();
    renderPackingList();
  } else if (target === 'erlebnisse') {
    renderJournalDays();
    renderPhotosGallery();
    if (viewName === 'photos') switchExpTab('journal');
    else if (viewName === 'taste') switchExpTab('taste');
  } else if (target === 'mehr') {
    if (viewName === 'drone-hub' || viewName === 'drone') {
      switchMoreTab('drone');
    } else if (viewName === 'weather') {
      switchMoreTab('weather');
    } else if (viewName === 'emergency') {
      switchMoreTab('emergency');
    } else if (viewName === 'playlist') {
      switchMoreTab('playlist');
    } else if (viewName === 'hub' || viewName === 'tools') {
      switchMoreTab('tools');
    }
  }

  if (window.Router && typeof window.Router.navigate === 'function') {
    if (window.Router.getCurrentRoute() !== target) {
      window.Router.navigate(target, { push: !skipHistory, silent: true });
    }
  } else if (!skipHistory && window.location.hash !== '#' + target && !window.location.hash.startsWith('#day-')) {
    history.replaceState(null, '', '#' + target);
  }
}

// Enhance jumpToDay for Seamless Navigation
function jumpToDay(dayNum) {
  if (window.TripPage) { showView('reise'); window.TripPage.selectDayNumber(dayNum); return; }
  showView('reise', true);

  if (window.innerWidth <= 960) {
    switchMobileReiseMode('plan');
  }

  const dayEl = document.getElementById('day-' + dayNum);
  if (dayEl) {
    dayEl.classList.add('revealed');
    dayEl.open = true;
    const plan = dayEl.querySelector('.day-plan-accordion');
    if (plan) plan.open = true;
    dayEl.classList.add('highlight-glow');
    setTimeout(() => dayEl.classList.remove('highlight-glow'), 2500);
    dayEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  focusDayOnMap(dayNum, null, false);
  updateMobileBottomSheet(dayNum);
}

// Mobile Reise Mode Switcher (Phase 4: [ Plan ] [ Karte ])
function switchMobileReiseMode(mode) {
  const planCol = document.querySelector('.timeline-column');
  const mapCol = document.querySelector('.map-sticky-column');
  const btnPlan = document.getElementById('mobile-reise-btn-plan');
  const btnMap = document.getElementById('mobile-reise-btn-map');
  const bottomSheet = document.getElementById('mobile-map-bottom-sheet');

  if (mode === 'plan') {
    if (planCol) planCol.style.display = 'block';
    if (mapCol) mapCol.style.display = 'none';
    if (btnPlan) btnPlan.classList.add('active');
    if (btnMap) btnMap.classList.remove('active');
    if (bottomSheet) bottomSheet.style.display = 'none';
  } else {
    if (planCol) planCol.style.display = 'none';
    if (mapCol) {
      mapCol.style.display = 'flex';
      mapCol.style.height = 'calc(100vh - 145px)';
    }
    if (btnPlan) btnPlan.classList.remove('active');
    if (btnMap) btnMap.classList.add('active');
    if (bottomSheet) {
      bottomSheet.style.display = 'block';
      updateMobileBottomSheet(activeFocusedDay || 1);
    }
    ensureRouteMapReady(true);
    setTimeout(() => {
      if (routeInteractiveMap) routeInteractiveMap.invalidateSize({ pan: false });
    }, 120);
  }
}

// Mobile Map Bottom Sheet Updater (Phase 4: TAG 14 · 4 HIGHLIGHTS + Chips + Pull-up)
function updateMobileBottomSheet(dayNum) {
  const sheet = document.getElementById('mobile-map-bottom-sheet');
  if (!sheet) return;
  const dayData = (typeof TRIP_DAYS_DATA !== 'undefined' ? TRIP_DAYS_DATA : []).find(d => d.day === dayNum) || { day: dayNum, title: 'Reisetag', date: '' };
  const spots = (typeof ALL_SIGHTSEEING_SPOTS !== 'undefined' ? ALL_SIGHTSEEING_SPOTS : []).filter(s => s.day === dayNum);

  const titleEl = document.getElementById('bottom-sheet-day-title');
  const spotsEl = document.getElementById('bottom-sheet-spots-list');
  const actionBtn = document.getElementById('bottom-sheet-plan-btn');
  const expandedEl = document.getElementById('bottom-sheet-expanded-content');

  const spotsCountLabel = spots.length > 0 ? `${spots.length} HIGHLIGHT${spots.length > 1 ? 'S' : ''}` : escapeHtml(dayData.title || 'ETAPPE');

  if (titleEl) {
    titleEl.innerHTML = `<strong>TAG ${dayData.day} · ${spotsCountLabel}</strong> <span style="font-size:0.75rem; margin-left:0.4rem">${escapeHtml(dayData.date || '')}</span>`;
  }

  if (spotsEl) {
    if (spots.length > 0) {
      spotsEl.innerHTML = spots.map(s => {
        let icon = '🏝️';
        if (s.name.includes('Heart Reef') || s.name.includes('Helikopter')) icon = '🚁';
        else if (s.name.includes('Falls') || s.name.includes('Park') || s.name.includes('Gardens')) icon = '🌿';
        else if (s.name.includes('Lookout') || s.name.includes('Inlet') || s.name.includes('View')) icon = '🏖️';
        else if (s.name.includes('Harbour') || s.name.includes('Bridge') || s.name.includes('Opera')) icon = '🏙️';
        else if (s.name.includes('Zoo') || s.name.includes('Koala') || s.name.includes('Pinguin')) icon = '🦘';
        return `
          <span class="spot-sheet-chip" onclick="focusSpotOnMap(${s.id}, event)" title="${escapeHtml(s.name)}">
            <span>${icon}</span> ${escapeHtml(s.name)}
          </span>
        `;
      }).join('');
    } else {
      spotsEl.innerHTML = `<span style="font-size:0.8rem"><i class="fa-solid fa-route"></i> ${escapeHtml(dayData.drive || (dayData.transportType === 'flight' ? 'Flugreise' : 'Fahrtetappe'))}</span>`;
    }
  }

  if (expandedEl) {
    expandedEl.innerHTML = `
      <div><strong>🏁 Start:</strong> ${escapeHtml(dayData.start || '-')} ➔ <strong>Ziel:</strong> ${escapeHtml(dayData.destination || '-')}</div>
      <div><strong>🛣️ Distanz:</strong> ${escapeHtml(dayData.distance || '-')} • <strong>Fahrzeit:</strong> ${escapeHtml(dayData.driveTime || '-')}</div>
      <div><strong>🏨 Unterkunft:</strong> ${escapeHtml(dayData.accommodation || '-')}</div>
    `;
  }

  if (actionBtn) {
    actionBtn.onclick = (e) => {
      if (e) e.stopPropagation();
      jumpToDay(dayData.day);
    };
  }
}

// Bottom Sheet Hochziehen / Minimieren Toggle
function toggleMobileBottomSheet() {
  const sheet = document.getElementById('mobile-map-bottom-sheet');
  const expandedEl = document.getElementById('bottom-sheet-expanded-content');
  if (!sheet) return;
  sheet.classList.toggle('sheet-expanded');
  if (expandedEl) {
    expandedEl.style.display = sheet.classList.contains('sheet-expanded') ? 'flex' : 'none';
  }
}
window.toggleMobileBottomSheet = toggleMobileBottomSheet;

// Organisation Shortcuts
function filterOrgCategory(catKey) {
  showView('organisation');
  document.querySelectorAll('.category-quick-tile').forEach(tile => {
    tile.classList.toggle('active', tile.getAttribute('data-org-cat') === catKey);
  });
  if (catKey === 'packing') {
    switchOrgTab('packing');
    document.getElementById('org-panel-packing')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  switchOrgTab('bookings');
  if (window.ManagementPage?.repo) {
    window.ManagementPage.filterBookings({flights:'flight',hotels:'hotel',car:'rentalcar',activities:'activity'}[catKey] || 'all');
    document.getElementById('manage-bookings')?.scrollIntoView({behavior:'smooth',block:'center'});
    return;
  }
  const filterSelect = document.getElementById('org-booking-filter-cat');
  if (filterSelect) {
    filterSelect.value = (catKey === 'bookings') ? 'all' : catKey;
    renderBookings();
    document.getElementById('org-panel-bookings')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Finanzen Sub-Tabs
function switchFinTab(tabKey) {
  document.querySelectorAll('.fin-subnav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabKey);
  });
  document.querySelectorAll('.fin-panel').forEach(panel => {
    panel.style.display = panel.id === 'fin-panel-' + tabKey ? 'block' : 'none';
  });
  if (tabKey === 'overview' && !window.ManagementPage) {
    setTimeout(() => {
      renderCurrentBudgetChart();
      updateBudgetCalculations();
    }, 60);
  }
}

// Erlebnisse Sub-Tabs
function switchExpTab(tabKey) {
  if (!document.getElementById('exp-panel-' + tabKey)) tabKey = 'journal';
  document.querySelectorAll('.exp-subnav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabKey);
  });
  document.querySelectorAll('.exp-panel').forEach(panel => {
    panel.style.display = panel.id === 'exp-panel-' + tabKey ? 'block' : 'none';
  });
  if (tabKey === 'journal') renderJournalDays();

}

// Mehr Sub-Tabs
function switchMoreTab(tabKey) {
  if (tabKey === 'playlist') tabKey = 'tools';
  if (!document.getElementById('more-panel-' + tabKey)) tabKey = 'drone';
  document.querySelectorAll('.more-subnav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabKey);
  });
  document.querySelectorAll('.more-panel').forEach(panel => {
    panel.style.display = panel.id === 'more-panel-' + tabKey ? 'block' : 'none';
  });
  const playlist = document.getElementById('playlist');
  if (playlist) {
    playlist.style.display = (tabKey === 'tools') ? '' : 'none';
  }
}

// Global Hash Router
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#', '').trim();
  if (hash.startsWith('day-') || hash.startsWith('tag-')) {
    const num = parseInt(hash.replace(/^(?:day|tag)-/, ''), 10);
    if (num) jumpToDay(num);
  } else if (hash && !window.Router) {
    showView(hash, true);
  }
});

// Setup Initial View & Router on Load
window.addEventListener('DOMContentLoaded', () => {
  if (window.UI && window.UI.modal && typeof window.UI.modal.init === 'function') {
    window.UI.modal.init();
  }
  if (window.Router && typeof window.Router.init === 'function') {
    window.Router.init();
  }

  const initialHash = window.location.hash.replace('#', '').trim();
  if (initialHash.startsWith('day-') || initialHash.startsWith('tag-')) {
    const num = parseInt(initialHash.replace(/^(?:day|tag)-/, ''), 10);
    if (num) setTimeout(() => jumpToDay(num), 300);
  } else if (initialHash && !window.Router) {
    showView(initialHash, true);
  } else if (!window.Router) {
    showView('dashboard', true);
  }
});

// Bridge existing persisted collections; new views reuse the same storage keys.
window.ManagementLegacy = {
 seed() { return { expenses:userExpenses, bookings:userBookings, totalBudget:Object.values(BUDGET_CATEGORIES_CONFIG).reduce((sum,c)=>sum+c.plannedEurP,0)*4 }; },
 sync(data) { userExpenses=data.expenses.map(x=>({...x,category:({accommodation:'hotels',transport:'flights',shopping:'groceries',other:'misc'})[x.category]||x.category,amountEur:x.currency==='EUR'?x.amount:x.amountEur,amountAud:x.currency==='AUD'?x.amount:x.amountAud})); userBookings=data.bookings; }
};

window.addEventListener('trip-store:ready', () => {
  TripStore.subscribe('*', ({event}) => {
    if (/^(days|day):/.test(event)) { updateOnsiteSpendMetrics(); }
  });
});

function mirrorSharedDisplays() {
  document.querySelectorAll('[data-shared-id]').forEach(el => {
    const id = el.dataset.sharedId;
    const source = document.getElementById(id);
    if (source && source !== el && /^(weather-|org-badge-)/.test(id) && el.innerHTML !== source.innerHTML) el.innerHTML = source.innerHTML;
  });
}
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-shared-id]').forEach(el => {
    const source=document.getElementById(el.dataset.sharedId);
    if (source && source !== el && /^(weather-|org-badge-)/.test(el.dataset.sharedId)) new MutationObserver(mirrorSharedDisplays).observe(source,{childList:true,subtree:true,characterData:true});
  });
  mirrorSharedDisplays();
});
