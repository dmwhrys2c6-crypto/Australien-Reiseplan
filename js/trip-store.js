/* =========================================================================
   AUSTRALIEN ROADTRIP 2027 – TRIP STORE & DYNAMIC TIMELINE LOADER
   Modulare Architektur (Schritt 1): Asynchroner Loader für data/trip-days.json,
   reaktiver Store, Fallback/Offline-Unterstützung & Timeline-Renderer.
   ========================================================================= */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TripStore = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEY = 'aus_trip_days_v1';
  const listeners = new Map();

  // Embedded Fallback Data for offline / file:// protocol
  const FALLBACK_TRIP_DAYS = [
  {
    "dayNumber": 1,
    "date": "2027-03-21",
    "dayOfWeek": "So",
    "title": "Abreise aus Wien",
    "routeBadge": "Langstreckenflug VIE → SYD",
    "transportType": "plane",
    "highlights": [
      "✈️ Langstreckenflug VIE → SIN → SYD",
      "🌏 Singapur Changi Jewel"
    ],
    "summary": "Flug von Wien (VIE) Richtung Sydney (SYD). Reisedauer: 11 Std. 40 Min. Über Nacht nach Singapur. 3 Std. 15 Min. Zwischenstopp in Singapur (SIN). Reisedauer: 7 Std. 55 Min. nach Sydney.",
    "activities": [
      {
        "time": "07:30",
        "title": "Letzter Gepäck-Check & Reisepässe bereitlegen"
      },
      {
        "time": "10:00",
        "title": "Treffpunkt Flughafen Wien-Schwechat (VIE) Terminal 3"
      },
      {
        "time": "11:30",
        "title": "Boarding Flug Scoot TR 12 nach Singapur (SIN)"
      },
      {
        "time": "23:45",
        "title": "Zwischenstopp Singapur Changi Jewel & Weiterflug nach Sydney"
      }
    ],
    "sights": [],
    "accommodation": {
      "cardTitle": "Hotel & Unterkunft",
      "name": "Langstreckenflug Scoot TR 12",
      "location": "Flugzeug / Transit",
      "nights": 1,
      "bookingLink": "",
      "bookingLabel": "Flug TR 12 gebucht",
      "mapsLink": "",
      "mapsLabel": "Hotel Standort",
      "costEur": 119,
      "status": "booked",
      "hasSubcard": false
    },
    "budgetItems": [
      {
        "title": "Langstreckenflug Wien → Sydney (gebucht)",
        "costEur": 453,
        "status": "paid",
        "statusText": "Bezahlt",
        "costFormatted": "453 €"
      }
    ],
    "dayBadge": "TAG 1 · WIEN → SYDNEY",
    "dateBadge": "21. MÄRZ (So)",
    "driveIcon": "fa-plane",
    "expandTrigger": "Details",
    "flightInfo": {
      "title": "Fluginformationen",
      "details": "Scoot - Economy Class - Boeing 787 - TR 12 / Abflug um 10:00 Uhr",
      "statusText": "Flug gebucht & bezahlt"
    },
    "hasBudgetSubcard": true,
    "budgetCardTitle": "Budget & Kosten",
    "suggestions": {
      "date": "2027-03-21",
      "title": "Ideen & Vorschläge für Tag 1 Verschlüsselt"
    }
  },
  {
    "dayNumber": 2,
    "date": "2027-03-22",
    "dayOfWeek": "Mo",
    "title": "Ankunft in Sydney (18:50 / Kingsford Smith Airport)",
    "routeBadge": "Transfer: ca. 25 Min.",
    "transportType": "car",
    "highlights": [
      "🛬 Ankunft Kingsford Smith Airport",
      "🏙️ Darling Harbour & Barangaroo"
    ],
    "summary": "Ankunft am Abend in Sydney, Hotel-Check-in & entspanntes Abendessen am Darling Harbour & Barangaroo Promenade.",
    "activities": [
      {
        "time": "18:50",
        "title": "Landung Kingsford Smith Airport Sydney (SYD)"
      },
      {
        "time": "20:15",
        "title": "Hotel Check-in The Ultimo (Chinatown / Haymarket)"
      },
      {
        "time": "21:00",
        "title": "Late Dinner & Drinks an der Barangaroo Promenade"
      }
    ],
    "sights": [
      {
        "id": "spot-1",
        "spotId": 1,
        "name": "Darling Harbour & Barangaroo Promenade",
        "highlight": "Flaniermeile & nächtliche Skyline mit erstklassigen Restaurants direkt am Wasser.",
        "photoSpot": "Foto-Spot &amp; Zeit: Entlang der Barangaroo Promenade mit Weitwinkel auf das beleuchtete Hafenbecken und die spiegelnden Skyline-Lichter.",
        "photoTime": "",
        "directions": "15 Min. Fußweg vom The Ultimo Hotel durch Chinatown Richtung Hafen.",
        "mapsUrl": "https://maps.google.com/?q=Darling%2BHarbour%2BBarangaroo%2BSydney",
        "coords": [
          -33.8695,
          151.201
        ],
        "region": "sydney"
      }
    ],
    "accommodation": {
      "cardTitle": "Hotel &amp; Unterkunft",
      "rawHtml": "<strong>The Ultimo Sydney</strong> (Chinatown / Haymarket) – 2 Nächte gebucht",
      "name": "The Ultimo Sydney",
      "location": "Chinatown / Haymarket",
      "nights": 2,
      "bookingLink": "https://www.theultimo.com.au",
      "bookingLabel": "Hotel Website",
      "mapsLink": "https://www.google.com/maps/place/The+Ultimo+Sydney/@-33.8693468,151.2114793,5362m/data=!3m1!1e3!4m9!3m8!1s0x6b12ae2469c0cd19:0x753bb008d058e737!5m2!4m1!1i2!8m2!3d-33.8806794!4d151.2034411!16s%2Fg%2F1vyxjkt2?entry=ttu",
      "mapsLabel": "Hotel Standort",
      "costEur": 119,
      "status": "booked",
      "hasSubcard": true
    },
    "budgetItems": [
      {
        "title": "The Ultimo Sydney Hotel & Transfer",
        "costEur": 150,
        "status": "planned",
        "statusText": "Geplant",
        "costFormatted": "150 €"
      }
    ],
    "dayBadge": "TAG 2 · SYDNEY",
    "dateBadge": "22. MÄRZ (Mo)",
    "driveIcon": "fa-car",
    "expandTrigger": "Details & Hotel",
    "flightInfo": null,
    "hasBudgetSubcard": false,
    "budgetCardTitle": "Budget & Kosten",
    "suggestions": {
      "date": "2027-03-22",
      "title": "Ideen & Vorschläge für Sydney Abend Verschlüsselt"
    }
  },
  {
    "dayNumber": 3,
    "date": "2027-03-23",
    "dayOfWeek": "Di",
    "title": "Sydney – Klassiker am Hafen & Manly Ferry",
    "routeBadge": "ÖPNV & Fähre",
    "transportType": "walk",
    "highlights": [
      "🎭 Sydney Opera House & Botanic Gardens",
      "🌉 Harbour Bridge & The Rocks"
    ],
    "summary": "Vormittags: Circular Quay, Sydney Opera House, Royal Botanic Garden & Mrs Macquarie’s Chair. Mittags: Historisches Viertel The Rocks und zu Fuß über die Sydney Harbour Bridge. Nachmittags: Fährfahrt nach Manly Beach & Sunset.",
    "activities": [
      {
        "time": "09:00",
        "title": "Brekkie & Flat White am Circular Quay mit Blick auf die Oper"
      },
      {
        "time": "12:30",
        "title": "Historischer Bummel durch The Rocks & Spaziergang über die Harbour Bridge"
      },
      {
        "time": "16:30",
        "title": "Manly Ferry ab Wharf 3 (traumhafte Sunset-Fahrt durch den Hafen)"
      },
      {
        "time": "19:30",
        "title": "Dinner am Manly Corso & nächtliche Rückfahrt"
      }
    ],
    "sights": [
      {
        "id": "spot-2",
        "spotId": 2,
        "name": "Sydney Opera House & Mrs Macquarie’s Chair",
        "highlight": "Weltberühmter Postkartenblick auf Oper und Harbour Bridge im warmen Abendlicht.",
        "photoSpot": "Foto-Spot &amp; Zeit: Von den Steinstufen am Mrs Macquarie’s Chair – nur hier hat man das Opernhaus und die Harbour Bridge perfekt versetzt in einer gemeinsamen Flucht.",
        "photoTime": "",
        "directions": "Bahn/Fähre bis Circular Quay + Spaziergang durch den Royal Botanic Garden.",
        "mapsUrl": "https://maps.google.com/?q=Mrs%2BMacquaries%2BChair%2BSydney",
        "coords": [
          -33.8585,
          151.2185
        ],
        "region": "sydney"
      },
      {
        "id": "spot-3",
        "spotId": 3,
        "name": "The Rocks & Harbour Bridge Pylon Walk",
        "highlight": "Historisches Sandsteinviertel mit Kopfsteinpflaster, Pubs & Fußgängeraufgang auf die Brücke.",
        "photoSpot": "Foto-Spot &amp; Zeit: Vom Pylon Lookout oder den Cumberland Street Treppen – fängt die massiven genieteten Stahlbögen von schräg unten ein. (☀️ Vormittags (Klarer Himmel))",
        "photoTime": "",
        "directions": "Fußgängeraufgang über die Cumberland Street Treppen westlich von Circular Quay.",
        "mapsUrl": "https://maps.google.com/?q=The%2BRocks%2BSydney",
        "coords": [
          -33.859,
          151.2085
        ],
        "region": "sydney"
      }
    ],
    "accommodation": {
      "cardTitle": "Hotel & Unterkunft",
      "name": "The Ultimo, Sydney",
      "location": "Sydney (NSW)",
      "nights": 1,
      "bookingLink": "https://www.theultimo.com.au",
      "bookingLabel": "Hotel Website (The Ultimo)",
      "mapsLink": "",
      "mapsLabel": "Hotel Standort",
      "costEur": 119,
      "status": "booked",
      "hasSubcard": false
    },
    "budgetItems": [
      {
        "title": "Manly Ferry & The Rocks Harbour Bridge Walk",
        "costEur": 35,
        "status": "planned",
        "statusText": "Geplant",
        "costFormatted": "35 €"
      }
    ],
    "dayBadge": "TAG 3 · SYDNEY",
    "dateBadge": "23. MÄRZ (Di)",
    "driveIcon": "fa-person-walking",
    "expandTrigger": "Details & Spots",
    "flightInfo": null,
    "hasBudgetSubcard": false,
    "budgetCardTitle": "Budget & Kosten",
    "suggestions": {
      "date": "2027-03-23",
      "title": "Ideen &amp; Vorschläge für Tag 3 Verschlüsselt"
    }
  },
  {
    "dayNumber": 4,
    "date": "2027-03-24",
    "dayOfWeek": "Mi",
    "title": "Sydney – Coastal Walk & Trendviertel",
    "routeBadge": "Bus & Küstenwanderung",
    "transportType": "bus",
    "highlights": [
      "🏖️ Bondi Beach & Icebergs Pool",
      "☕ Surry Hills & Crown Street"
    ],
    "summary": "Vormittags: Bondi Beach & spektakulärer Bondi to Coogee Coastal Walk. Nachmittags: Café-Kultur, Boutiquen & Street-Art in Surry Hills und Paddington.",
    "activities": [
      {
        "time": "09:30",
        "title": "Coastal Walk ab Bondi Beach starten (Richtung Bronte / Coogee)"
      },
      {
        "time": "13:00",
        "title": "Mittagssnack & Flat White mit Ozeanblick"
      },
      {
        "time": "14:00",
        "title": "Vintage-Bummel & Cafés in Surry Hills (Crown St)"
      },
      {
        "time": "18:30",
        "title": "Abendessen & Rooftop-Drinks in Darlinghurst"
      }
    ],
    "sights": [
      {
        "id": "spot-4",
        "spotId": 4,
        "name": "Bondi Beach & Icebergs Pool",
        "highlight": "6 km spektakulärer Klippenpfad am Pazifik vorbei an Tamarama, Bronte und dem Icebergs Pool.",
        "photoSpot": "Foto-Spot &amp; Zeit: Vom Klippenpfad direkt oberhalb des Bondi Icebergs Club – erhöhter Blickwinkel hinab auf die weißen Wellen, die in den Pool schwappen. (☀️ Vormittag (Klares Licht))",
        "photoTime": "",
        "directions": "Expressbus 333 ab City (Elizabeth St) direkt bis Bondi Beach.",
        "mapsUrl": "https://maps.google.com/?q=Bondi%2Bto%2BCoogee%2BWalk%2BSydney",
        "coords": [
          -33.8915,
          151.2767
        ],
        "region": "sydney"
      },
      {
        "id": "spot-5",
        "spotId": 5,
        "name": "Surry Hills & Paddington (Crown St)",
        "highlight": "Trendiges Szeneviertel mit viktorianischen Reihenhäusern, Vintage-Boutiquen und Cafés.",
        "photoSpot": "Foto-Spot &amp; Zeit: Kreuzungsbereich Crown St & Campbell St vor den viktorianischen Gusseisen-Balkonen und Specialty-Cafés. (☕ Nachmittags (Street Life))",
        "photoTime": "",
        "directions": "Bus 333/380 bis Taylor Square oder 15 Min. Spaziergang ab Central Station.",
        "mapsUrl": "https://maps.google.com/?q=Crown%2BStreet%2BSurry%2BHills%2BSydney",
        "coords": [
          -33.886,
          151.2135
        ],
        "region": "sydney"
      }
    ],
    "accommodation": {
      "cardTitle": "Hotel & Unterkunft",
      "name": "The Ultimo, Sydney",
      "location": "Sydney (NSW)",
      "nights": 1,
      "bookingLink": "https://www.theultimo.com.au",
      "bookingLabel": "Hotel Website (The Ultimo)",
      "mapsLink": "",
      "mapsLabel": "Hotel Standort",
      "costEur": 119,
      "status": "booked",
      "hasSubcard": false
    },
    "budgetItems": [
      {
        "title": "Bondi Coastal Walk Verpflegung & Cafés",
        "costEur": 40,
        "status": "planned",
        "statusText": "Geplant",
        "costFormatted": "40 €"
      }
    ],
    "dayBadge": "TAG 4 · SYDNEY",
    "dateBadge": "24. MÄRZ (Mi)",
    "driveIcon": "fa-bus",
    "expandTrigger": "Details & Spots",
    "flightInfo": null,
    "hasBudgetSubcard": false,
    "budgetCardTitle": "Budget & Kosten",
    "suggestions": {
      "date": "2027-03-24",
      "title": "Ideen &amp; Vorschläge für Tag 4 Verschlüsselt"
    }
  },
  {
    "dayNumber": 5,
    "date": "2027-03-25",
    "dayOfWeek": "Do",
    "title": "Flug nach Ballina / Byron Bay",
    "routeBadge": "Flug SYD → BNK",
    "transportType": "plane",
    "highlights": [
      "✈️ Inlandsflug SYD → Ballina",
      "🌅 Cape Byron Lighthouse & Ostkap"
    ],
    "summary": "Morgens Flug SYD → BNK (1,5 Std.). Mietwagen am Flughafen übernehmen. Fahrt nach Byron Bay, Check-in und Spätnachmittag am Cape Byron Lighthouse.",
    "activities": [
      {
        "time": "08:00",
        "title": "Check-out The Ultimo Sydney &amp; Transfer zum Flughafen"
      },
      {
        "time": "10:25",
        "title": "Flug Jetstar JQ 458 nach Ballina Byron Gateway (BNK)"
      },
      {
        "time": "13:00",
        "title": "Mietwagenübernahme am Flughafen Ballina &amp; Fahrt nach Byron Bay"
      },
      {
        "time": "16:00",
        "title": "Sonnenuntergang am Cape Byron Lighthouse &amp; Lookout"
      }
    ],
    "sights": [
      {
        "id": "spot-6",
        "spotId": 6,
        "name": "Cape Byron Lighthouse",
        "highlight": "Östlichster Punkt des australischen Festlands mit 360°-Ozeanblick und häufigen Delfinsichtungen.",
        "photoSpot": "Foto-Spot &amp; Zeit: Auf dem Holzsteg-Pfad ca. 100 m unterhalb des Leuchtturms mit Blick nach oben – fängt den Turm samt Klippenkante ein.",
        "photoTime": "",
        "directions": "Mietwagen über Lighthouse Road (Parkplatz am Leuchtturm).",
        "mapsUrl": "https://maps.google.com/?q=Cape%2BByron%2BLighthouse",
        "coords": [
          -28.6384,
          153.6366
        ],
        "region": "byron"
      }
    ],
    "accommodation": {
      "cardTitle": "Unterkunft Byron Bay",
      "rawHtml": "<strong>AirBnB East Ballina:</strong> 25.03. – 27.03. (2 Nächte)",
      "name": "AirBnB East Ballina: 25.03. – 27.03.",
      "location": "2 Nächte",
      "nights": 1,
      "bookingLink": "https://www.airbnb.at/rooms/1065553106126009714",
      "bookingLabel": "AirBnB Link",
      "mapsLink": "",
      "mapsLabel": "Hotel Standort",
      "costEur": 119,
      "status": "booked",
      "hasSubcard": true
    },
    "budgetItems": [
      {
        "title": "Inlandsflug SYD → Ballina (125 €) + Mietwagen (80 €)",
        "costEur": 205,
        "status": "planned",
        "statusText": "Geplant",
        "costFormatted": "205 €"
      }
    ],
    "dayBadge": "TAG 5 · BYRON BAY",
    "dateBadge": "25. MÄRZ (Do)",
    "driveIcon": "fa-plane",
    "expandTrigger": "Details & Flug",
    "flightInfo": {
      "title": "Fluginformationen",
      "details": "Jetstar - Economy Class - Airbus A320 - JQ 458 / Abflug um 10:25 Uhr",
      "statusText": "Flug gebucht & bezahlt (54 € p.P.)"
    },
    "hasBudgetSubcard": false,
    "budgetCardTitle": "Budget & Kosten",
    "suggestions": {
      "date": "2027-03-25",
      "title": "Ideen für Byron Bay Verschlüsselt"
    }
  },
  {
    "dayNumber": 6,
    "date": "2027-03-26",
    "dayOfWeek": "Fr",
    "title": "Byron Bay & Erlebnisse am Ozean",
    "routeBadge": "Kajak- oder Bootstour",
    "transportType": "ferry",
    "highlights": [
      "🏄 Wategos Beach & The Pass",
      "🐬 Delfin-Kajaktour am Ozean"
    ],
    "summary": "Vormittags: Geführte Seekajak-Tour (Delfine, Rochen & Meeresschildkröten beobachten!). Nachmittags: Strand-Relaxen am Tallow Beach, Bummel durch die Surfer-Boutiquen und Craft-Bier zum Sonnenuntergang.",
    "activities": [
      {
        "time": "08:30",
        "title": "Geführte Delfin-Kajaktour ab Main Beach Byron Bay"
      },
      {
        "time": "14:00",
        "title": "Chillen & Surfen am The Pass & Wategos Beach"
      },
      {
        "time": "18:30",
        "title": "Beach Hotel Live-Musik, Craft Beer & entspanntes Abendessen"
      }
    ],
    "sights": [
      {
        "id": "spot-7",
        "spotId": 7,
        "name": "Wategos Beach & The Pass",
        "highlight": "Berühmter Surf-Break für Longboards, türkisblaues Wasser und Meeresschildkröten.",
        "photoSpot": "Foto-Spot &amp; Zeit: Vom erhöhten Holz-Aussichtsturm direkt über dem Pass – fantastischer Überblick über Surfer auf den endlosen Wellen.",
        "photoTime": "",
        "directions": "Küstenstraße Richtung Leuchtturm oder idyllischer Fußweg ab Clarkes Beach.",
        "mapsUrl": "https://maps.google.com/?q=Wategos%2BBeach%2BByron%2BBay",
        "coords": [
          -28.636,
          153.628
        ],
        "region": "byron"
      }
    ],
    "accommodation": {
      "cardTitle": "Hotel & Unterkunft",
      "name": "AirBnB East Ballina",
      "location": "East Ballina / Byron Bay (NSW)",
      "nights": 1,
      "bookingLink": "https://www.airbnb.at/rooms/1065553106126009714",
      "bookingLabel": "AirBnB Buchung öffnen",
      "mapsLink": "",
      "mapsLabel": "Hotel Standort",
      "costEur": 119,
      "status": "booked",
      "hasSubcard": false
    },
    "budgetItems": [
      {
        "title": "AirBnB East Ballina & Kajaktour",
        "costEur": 65,
        "status": "planned",
        "statusText": "Geplant",
        "costFormatted": "65 €"
      }
    ],
    "dayBadge": "TAG 6 · BYRON BAY",
    "dateBadge": "26. MÄRZ (Fr)",
    "driveIcon": "fa-ship",
    "expandTrigger": "Details & Spots",
    "flightInfo": null,
    "hasBudgetSubcard": false,
    "budgetCardTitle": "Budget & Kosten",
    "suggestions": {
      "date": "2027-03-26",
      "title": "Ideen &amp; Vorschläge für Tag 6 Verschlüsselt"
    }
  },
  {
    "dayNumber": 7,
    "date": "2027-03-27",
    "dayOfWeek": "Sa",
    "title": "Byron Bay → Gold Coast → Brisbane",
    "routeBadge": "Byron → Gold Coast → BNE: ca. 2,5 Std.",
    "transportType": "car",
    "highlights": [
      "🏄 Burleigh Heads Surfer-Lookout",
      "🌉 Howard Smith Wharves & Story Bridge"
    ],
    "summary": "Fahrt gen Norden. Zwischenstopp an der Gold Coast: Aussichtspunkt Burleigh Heads oder SkyPoint Q1 Tower. Weiterfahrt nach Brisbane, Check-in und Abend an den belebten Howard Smith Wharves unter der Story Bridge.",
    "activities": [
      {
        "time": "09:30",
        "title": "Abfahrt Byron Bay Richtung Norden über den Pacific Highway"
      },
      {
        "time": "11:30",
        "title": "Stopp Surfers Paradise & Strandspaziergang Burleigh Heads"
      },
      {
        "time": "16:00",
        "title": "Check-in Hotel Rambla @ South City Square Brisbane"
      },
      {
        "time": "19:00",
        "title": "Craft Beer & Dinner bei den Howard Smith Wharves"
      }
    ],
    "sights": [
      {
        "id": "spot-8",
        "spotId": 8,
        "name": "Burleigh Heads Lookout",
        "highlight": "Spektakulärer Surfer-Point & Panoramablick auf die Hochhaus-Skyline von Surfers Paradise.",
        "photoSpot": "Foto-Spot &amp; Zeit: Tumgun Lookout im Burleigh Head Nationalpark – Rahmung der Skyline durch die australischen Pinienbäume.",
        "photoTime": "",
        "directions": "M1 Richtung Norden, Parkplatz Goodwin Terrace direkt am Nationalpark.",
        "mapsUrl": "https://maps.google.com/?q=Burleigh%2BHeads%2BLookout",
        "coords": [
          -28.0933,
          153.456
        ],
        "region": "byron"
      },
      {
        "id": "spot-9",
        "spotId": 9,
        "name": "Howard Smith Wharves & Story Bridge",
        "highlight": "Brauereien, Bars & erstklassige Lokale direkt unter den Bögen der beleuchteten Story Bridge.",
        "photoSpot": "Foto-Spot &amp; Zeit: Direkt an der Uferkante der Wharves vor Felons Brewing – Weitwinkel von unten schräg gegen das Brückengerüst.",
        "photoTime": "",
        "directions": "Kurzer Fußweg vom Hotel Rambla in Woolloongabba oder mit der Fähre.",
        "mapsUrl": "https://maps.google.com/?q=Howard%2BSmith%2BWharves%2BBrisbane",
        "coords": [
          -27.4608,
          153.036
        ],
        "region": "brisbane"
      }
    ],
    "accommodation": {
      "cardTitle": "Hotel &amp; Unterkunft",
      "rawHtml": "<strong>Rambla @ Story House</strong> (Woolloongabba / Kangaroo Point, Brisbane) – 2 Nächte\n                        gebucht",
      "name": "Rambla @ Story House",
      "location": "Woolloongabba / Kangaroo Point, Brisbane",
      "nights": 2,
      "bookingLink": "https://www.rambla.com.au/locations/story-house",
      "bookingLabel": "Hotel Link",
      "mapsLink": "",
      "mapsLabel": "Hotel Standort",
      "costEur": 119,
      "status": "booked",
      "hasSubcard": true
    },
    "budgetItems": [
      {
        "title": "Hotel Brisbane (95 €) + Sprit Anteil (25 €)",
        "costEur": 120,
        "status": "planned",
        "statusText": "Geplant",
        "costFormatted": "120 €"
      }
    ],
    "dayBadge": "TAG 7 · GOLD COAST & BRISBANE",
    "dateBadge": "27. MÄRZ (Sa)",
    "driveIcon": "fa-car",
    "expandTrigger": "Details & Hotel",
    "flightInfo": null,
    "hasBudgetSubcard": false,
    "budgetCardTitle": "Budget & Kosten",
    "suggestions": {
      "date": "2027-03-27",
      "title": "Ideen für Brisbane Verschlüsselt"
    }
  },
  {
    "dayNumber": 8,
    "date": "2027-03-28",
    "dayOfWeek": "So",
    "title": "Brisbane – Kultur, Fluss & Aussicht",
    "routeBadge": "CityCat Fähre",
    "transportType": "ferry",
    "highlights": [
      "🏖️ South Bank Streets Beach",
      "🌄 Mt Coot-tha Summit Lookout"
    ],
    "summary": "South Bank Parklands (inkl. Streets Beach Lagune), moderne Kunst in der QAGOMA Galerie, Katamaran-Fahrt mit der CityCat-Fähre, Kangaroo Point Cliffs und Panoramablick zum Sonnenuntergang vom Mount Coot-tha.",
    "activities": [
      {
        "time": "10:00",
        "title": "CityCat Katamaran-Fahrt auf dem Brisbane River"
      },
      {
        "time": "13:30",
        "title": "Mittagspause & Spaziergang South Bank Parklands"
      },
      {
        "time": "18:30",
        "title": "Sunset & Panoramadinner am Mt Coot-tha Summit Lookout"
      }
    ],
    "sights": [
      {
        "id": "spot-10",
        "spotId": 10,
        "name": "South Bank Parklands & Streets Beach",
        "highlight": "Australiens einziger künstlicher Stadtstrand mitten im Zentrum mit tropischen Gärten.",
        "photoSpot": "Foto-Spot &amp; Zeit: Von den Holzliegen an Streets Beach mit den Palmen im Vordergrund und den Wolkenkratzern im Hintergrund.",
        "photoTime": "",
        "directions": "Über die Fußgängerbrücke Goodwill Bridge oder per CityCat Fähre.",
        "mapsUrl": "https://maps.google.com/?q=Streets%2BBeach%2BSouth%2BBank%2BBrisbane",
        "coords": [
          -27.4785,
          153.0205
        ],
        "region": "brisbane"
      },
      {
        "id": "spot-11",
        "spotId": 11,
        "name": "Mt Coot-tha Summit Lookout",
        "highlight": "Höchster Panoramablick über die Millionenstadt Brisbane bis hin zur Moreton Bay.",
        "photoSpot": "Foto-Spot &amp; Zeit: An der vorderen steinernen Aussichtsplattform mit Blick genau nach Osten über das gesamte Tal von Brisbane.",
        "photoTime": "",
        "directions": "Ca. 20 Minuten Autofahrt westlich des Stadtzentrums.",
        "mapsUrl": "https://maps.google.com/?q=Mount%2BCoot-tha%2BLookout%2BBrisbane",
        "coords": [
          -27.477,
          152.9535
        ],
        "region": "brisbane"
      }
    ],
    "accommodation": {
      "cardTitle": "Hotel & Unterkunft",
      "name": "Rambla at Story House",
      "location": "Brisbane City (QLD)",
      "nights": 1,
      "bookingLink": "https://www.rambla.com.au/locations/story-house",
      "bookingLabel": "Rambla Hotel Website",
      "mapsLink": "",
      "mapsLabel": "Hotel Standort",
      "costEur": 119,
      "status": "booked",
      "hasSubcard": false
    },
    "budgetItems": [
      {
        "title": "Brisbane CityCat Katamaran & South Bank",
        "costEur": 25,
        "status": "planned",
        "statusText": "Geplant",
        "costFormatted": "25 €"
      }
    ],
    "dayBadge": "TAG 8 · BRISBANE",
    "dateBadge": "28. MÄRZ (So)",
    "driveIcon": "fa-ship",
    "expandTrigger": "Details & Spots",
    "flightInfo": null,
    "hasBudgetSubcard": false,
    "budgetCardTitle": "Budget & Kosten",
    "suggestions": {
      "date": "2027-03-28",
      "title": "Ideen &amp; Vorschläge für Tag 8 Verschlüsselt"
    }
  },
  {
    "dayNumber": 9,
    "date": "2027-03-29",
    "dayOfWeek": "Mo",
    "title": "Brisbane – Riverwalk & Urban Lifestyle",
    "routeBadge": "Entspanntes Erkunden",
    "transportType": "walk",
    "highlights": [
      "🐊 Australia Zoo Crocodile Hunter",
      "🏙️ Brisbane Riverwalk & CityCat"
    ],
    "summary": "Spaziergang über den Brisbane Riverwalk, Kaffeepause in Fortitude Valley & James Street, Besuch des New Farm Park & Brisbane Powerhouse.",
    "activities": [
      {
        "time": "08:30",
        "title": "Abfahrt Brisbane Richtung Sunshine Coast Hinterland"
      },
      {
        "time": "09:30",
        "title": "Eintritt Australia Zoo & Kängurus füttern in den offenen Gehegen"
      },
      {
        "time": "12:00",
        "title": "Wildlife Warriors Show im Crocoseum (Krokodile, Vögel & Schlangen)"
      },
      {
        "time": "17:00",
        "title": "Rückfahrt nach Brisbane & entspanntes Abendessen"
      }
    ],
    "sights": [
      {
        "id": "spot-12",
        "spotId": 12,
        "name": "Australia Zoo (Home of the Crocodile Hunter)",
        "highlight": "Steve Irwins weltberühmter Zoo mit riesigen Freigehegen für Koalas, Kängurus und Krokodile.",
        "photoSpot": "Foto-Spot &amp; Zeit: In den offenen Roo-Heaven Freigehegen auf Augenhöhe mit den Kängurus und im Crocoseum. (🦘 Vormittags (Fütterungszeit))",
        "photoTime": "",
        "directions": "Ca. 60 Min. Fahrt über Bruce Highway (M1) und Steve Irwin Way nach Beerwah.",
        "mapsUrl": "https://maps.google.com/?q=Australia%2BZoo%2BBeerwah",
        "coords": [
          -26.837,
          152.961
        ],
        "region": "brisbane"
      }
    ],
    "accommodation": {
      "cardTitle": "Hotel & Unterkunft",
      "name": "Rambla at Story House",
      "location": "Brisbane City (QLD)",
      "nights": 1,
      "bookingLink": "https://www.rambla.com.au/locations/story-house",
      "bookingLabel": "Rambla Hotel Website",
      "mapsLink": "",
      "mapsLabel": "Hotel Standort",
      "costEur": 119,
      "status": "booked",
      "hasSubcard": false
    },
    "budgetItems": [
      {
        "title": "Australia Zoo Beerwah Ticket",
        "costEur": 60,
        "status": "planned",
        "statusText": "Geplant",
        "costFormatted": "60 €"
      }
    ],
    "dayBadge": "TAG 9 · BRISBANE & SUNSHINE COAST",
    "dateBadge": "29. MÄRZ (Mo)",
    "driveIcon": "fa-person-walking",
    "expandTrigger": "Details",
    "flightInfo": null,
    "hasBudgetSubcard": false,
    "budgetCardTitle": "Budget & Kosten",
    "suggestions": {
      "date": "2027-03-29",
      "title": "Ideen für Tag 9 Verschlüsselt"
    }
  },
  {
    "dayNumber": 10,
    "date": "2027-03-30",
    "dayOfWeek": "Di",
    "title": "Brisbane → Glass House Mountains → Noosa",
    "routeBadge": "Panoramaroute → Noosa: ca. 2,5 Std.",
    "transportType": "car",
    "highlights": [
      "⛰️ Mt Ngungun Glass House Mts",
      "🌊 Fairy Pools & Noosa Nationalpark"
    ],
    "summary": "Fahrt über die Panoramaroute der Glass House Mountains (Mt. Ngungun Wanderung) & Bergdorf Montville nach Noosa Heads. Nachmittags: Küstenwanderung im Noosa National Park (Fairy Pools, Tea Tree Bay & Koala-Spotting!).",
    "activities": [
      {
        "time": "08:30",
        "title": "Abfahrt Brisbane nach Norden"
      },
      {
        "time": "10:00",
        "title": "Gipfelwanderung Mt Ngungun mit spektakulärer Rundumsicht"
      },
      {
        "time": "14:30",
        "title": "Fahrt nach Noosa & Check-in Bounce Noosa"
      },
      {
        "time": "15:30",
        "title": "Coastal Walk im Noosa Nationalpark zu den Fairy Pools"
      }
    ],
    "sights": [
      {
        "id": "spot-13",
        "spotId": 13,
        "name": "Mt Ngungun (Glass House Mountains)",
        "highlight": "360°-Gipfelblick auf die Vulkankegel der Glass House Mountains nach ca. 40 Min. Aufstieg.",
        "photoSpot": "Foto-Spot &amp; Zeit: Vom felsigen Gipfelplateau mit Blick auf den markanten Mt Tibrogargan und Mt Coonowrin.",
        "photoTime": "",
        "directions": "Glass House Mountains NP, Parkplatz Fullertons Road.",
        "mapsUrl": "https://maps.google.com/?q=Mount%2BNgungun%2BTrack",
        "coords": [
          -26.9015,
          152.935
        ],
        "region": "brisbane"
      },
      {
        "id": "spot-14",
        "spotId": 14,
        "name": "Fairy Pools / Noosa National Park",
        "highlight": "Malerischer Küstenpfad, Natur-Felsenpools und einer der besten Spots für wilde Koalas.",
        "photoSpot": "Foto-Spot &amp; Zeit: Direkt auf den Basaltfelsen oberhalb des Beckens senkrecht hinab auf das türkisfarbene Wasser. (🌊 Nur bei Low Tide (Niedrigwasser))",
        "photoTime": "",
        "directions": "Parkplatz Noosa NP am Ende der Park Road.",
        "mapsUrl": "https://maps.google.com/?q=Noosa%2BNational%2BPark",
        "coords": [
          -26.381,
          153.111
        ],
        "region": "brisbane"
      }
    ],
    "accommodation": {
      "cardTitle": "Hotel &amp; Unterkunft",
      "rawHtml": "<strong>Bounce Noosa / Villa Noosa Hotel</strong> (Noosaville) – 2 Nächte gebucht",
      "name": "Bounce Noosa / Villa Noosa Hotel",
      "location": "Noosaville",
      "nights": 2,
      "bookingLink": "https://www.villanoosa.com.au",
      "bookingLabel": "Hotel Link",
      "mapsLink": "",
      "mapsLabel": "Hotel Standort",
      "costEur": 119,
      "status": "booked",
      "hasSubcard": true
    },
    "budgetItems": [
      {
        "title": "Villa Noosa Hotel & Nationalpark",
        "costEur": 90,
        "status": "planned",
        "statusText": "Geplant",
        "costFormatted": "90 €"
      }
    ],
    "dayBadge": "TAG 10 · NOOSA & SUNSHINE COAST",
    "dateBadge": "30. MÄRZ (Di)",
    "driveIcon": "fa-car",
    "expandTrigger": "Details & Hotel",
    "flightInfo": null,
    "hasBudgetSubcard": false,
    "budgetCardTitle": "Budget & Kosten",
    "suggestions": {
      "date": "2027-03-30",
      "title": "Ideen für Noosa Verschlüsselt"
    }
  },
  {
    "dayNumber": 11,
    "date": "2027-03-31",
    "dayOfWeek": "Mi",
    "title": "Noosa (Kängurus am Morgen) → Carlo Sand Blow → Hervey Bay",
    "routeBadge": "Noosa → Rainbow → Hervey: ca. 2,5 Std.",
    "transportType": "car",
    "highlights": [
      "🦘 Kängurus am Morning Walk",
      "🏖️ Carlo Sand Blow Riesendüne"
    ],
    "summary": "Frühmorgens: Wilde Kängurus in den Parks und Graslandschaften rund um Noosa beobachten. Anschließend Fahrt nach Rainbow Beach, Erklimmen der riesigen Sanddüne <i>Carlo Sand Blow</i> zum Sonnenuntergang und Weiterfahrt nach Hervey Bay.",
    "activities": [
      {
        "time": "09:00",
        "title": "Morgenbad & Kaffee am Noosa Main Beach"
      },
      {
        "time": "13:00",
        "title": "Fahrt nach Rainbow Beach entlang der Küste"
      },
      {
        "time": "14:30",
        "title": "Erkundung der Carlo Sand Blow Riesensanddüne"
      },
      {
        "time": "18:00",
        "title": "Check-in Fraser Coast Top Tourist Park in Hervey Bay"
      }
    ],
    "sights": [
      {
        "id": "spot-15",
        "spotId": 15,
        "name": "Carlo Sand Blow",
        "highlight": "Riesige 15 Hektar große Sanddüne direkt über dem Meer mit Blick auf Double Island Point.",
        "photoSpot": "Foto-Spot &amp; Zeit: Oberer Scheitelkamm der Düne mit Blick nach Westen über den Great Sandy Strait für dramatische Schattenwürfe im Sand.",
        "photoTime": "",
        "directions": "Cooloola Drive in Rainbow Beach, 10 Min. Fußweg über den Dünenpfad.",
        "mapsUrl": "https://maps.google.com/?q=Carlo%2BSand%2BBlow%2BRainbow%2BBeach",
        "coords": [
          -25.908,
          153.0964
        ],
        "region": "islands"
      }
    ],
    "accommodation": {
      "cardTitle": "Hotel &amp; Unterkunft",
      "rawHtml": "<strong>Woolshed Eco Lodge / Nightcap Hotel</strong> (Hervey Bay) – 1 Nacht gebucht",
      "name": "Woolshed Eco Lodge / Nightcap Hotel",
      "location": "Hervey Bay",
      "nights": 1,
      "bookingLink": "https://nightcap.nighteliercollective.com.au",
      "bookingLabel": "Hotel Website",
      "mapsLink": "",
      "mapsLabel": "Hotel Standort",
      "costEur": 119,
      "status": "booked",
      "hasSubcard": true
    },
    "budgetItems": [
      {
        "title": "Hervey Bay Kondari Resort & Rainbow Beach",
        "costEur": 95,
        "status": "planned",
        "statusText": "Geplant",
        "costFormatted": "95 €"
      }
    ],
    "dayBadge": "TAG 11 · RAINBOW BEACH & HERVEY BAY",
    "dateBadge": "31. MÄRZ (Mi)",
    "driveIcon": "fa-car",
    "expandTrigger": "Details & Hotel",
    "flightInfo": null,
    "hasBudgetSubcard": false,
    "budgetCardTitle": "Budget & Kosten",
    "suggestions": {
      "date": "2027-03-31",
      "title": "Ideen für Tag 11 Verschlüsselt"
    }
  },
  {
    "dayNumber": 12,
    "date": "2027-04-01",
    "dayOfWeek": "Do",
    "title": "K’gari (Fraser Island) & Nachtbus nach Norden",
    "routeBadge": "Tagestour & Nachtbus: 11 Std.",
    "transportType": "bus",
    "highlights": [
      "🏝️ Lake McKenzie Quarzsandsee",
      "🚢 Maheno Wreck & 75 Mile Beach"
    ],
    "summary": "Ganztägige geführte 4WD-Tour auf K’gari: Lake McKenzie (glasklarer Süßwassersee), 75 Mile Beach Sand-Highway, Maheno Shipwreck & Eli Creek. Abends Mietwagenabgabe in Hervey Bay und Greyhound-Nachtbus nach Airlie Beach.",
    "activities": [
      {
        "time": "07:30",
        "title": "Abfahrt ganztägige 4WD-Explorer-Tour nach K'gari (Fraser Island)"
      },
      {
        "time": "11:00",
        "title": "Baden im kristallklaren Lake McKenzie"
      },
      {
        "time": "14:00",
        "title": "Fahrt über den 75 Mile Beach Highway zum Maheno Schiffswrack"
      },
      {
        "time": "17:00",
        "title": "Rückkehr Hervey Bay & Mietwagen-Rückgabe"
      },
      {
        "time": "20:00",
        "title": "Einstieg in den Greyhound Nachtbus nach Airlie Beach"
      }
    ],
    "sights": [
      {
        "id": "spot-16",
        "spotId": 16,
        "name": "Lake McKenzie & Maheno Wreck (K’gari)",
        "highlight": "Schneeweißer Quarzsand, glasklarer Süßwassersee und historisches Schiffswrack am 75 Mile Beach.",
        "photoSpot": "Foto-Spot &amp; Zeit: 30 Meter schräg vor dem Bug am Strand – die Brandung umspült die Wrackrippen für tolle Kontrastaufnahmen.",
        "photoTime": "",
        "directions": "Ausschließlich per geführter 4WD-Tour oder 4x4-Fahrzeug ab Hervey Bay.",
        "mapsUrl": "https://maps.google.com/?q=Lake%2BMcKenzie%2BFraser%2BIsland",
        "coords": [
          -25.449,
          153.058
        ],
        "region": "islands"
      }
    ],
    "accommodation": {
      "cardTitle": "Hotel & Unterkunft",
      "name": "Greyhound Australia Nachtbus",
      "location": "K’gari Fraser Island / Nachtbus",
      "nights": 1,
      "bookingLink": "https://www.greyhound.com.au",
      "bookingLabel": "Greyhound Bus Ticket",
      "mapsLink": "",
      "mapsLabel": "Hotel Standort",
      "costEur": 119,
      "status": "booked",
      "hasSubcard": false
    },
    "budgetItems": [
      {
        "title": "K’gari 4x4 Offroad-Tour (180 €) + Nachtbus (55 €)",
        "costEur": 235,
        "status": "planned",
        "statusText": "Geplant",
        "costFormatted": "235 €"
      }
    ],
    "dayBadge": "TAG 12 · K’GARI (FRASER ISLAND)",
    "dateBadge": "01. APRIL (Do)",
    "driveIcon": "fa-bus",
    "expandTrigger": "Details & Ausflug",
    "flightInfo": null,
    "hasBudgetSubcard": false,
    "budgetCardTitle": "Budget & Kosten",
    "suggestions": {
      "date": "2027-04-01",
      "title": "Ideen &amp; Vorschläge für Tag 12 Verschlüsselt"
    }
  },
  {
    "dayNumber": 13,
    "date": "2027-04-02",
    "dayOfWeek": "Fr",
    "title": "Ankunft Airlie Beach & Whitsundays Helikopter-Rundflug",
    "routeBadge": "Helikopter / Rundflug",
    "transportType": "helicopter",
    "highlights": [
      "🌴 Coral Sea Marina Esplanade",
      "🚁 Whitsundays Helikopterflug"
    ],
    "summary": "Morgens Ankunft mit dem Bus in Airlie Beach. Check-in in den Apartments, Schlaf nachholen & Strandlagune erkunden. Am Nachmittag: Spektakulärer Helikopter- / Rundflug über das berühmte Heart Reef & Whitehaven Beach.",
    "activities": [
      {
        "time": "06:30",
        "title": "Ankunft Greyhound Nachtbus in Airlie Beach & leckeres Frühstück"
      },
      {
        "time": "10:00",
        "title": "Frühes Check-in / Gepäckabgabe Whitsunday Terraces Resort"
      },
      {
        "time": "14:00",
        "title": "Spektakulärer Helikopter-Rundflug über das Heart Reef & Whitehaven Beach"
      },
      {
        "time": "18:30",
        "title": "Entspanntes Abendessen an der Esplanade"
      }
    ],
    "sights": [
      {
        "id": "spot-17",
        "spotId": 17,
        "name": "Airlie Beach Esplanade & Coral Sea Marina",
        "highlight": "Tropisches Tor zu den Whitsunday-Inseln mit Palmenpromenade und Marina-Atmosphäre.",
        "photoSpot": "Foto-Spot &amp; Zeit: Aus dem Helikopter-Fenster mit Blick senkrecht hinab auf das herzförmige Heart Reef im Korallenmeer. (🚁 Nachmittag (Helikopterflug))",
        "photoTime": "",
        "directions": "Fußweg ab Greyhound Haltestelle / Hotel.",
        "mapsUrl": "https://maps.google.com/?q=Coral%2BSea%2BMarina%2BAirlie%2BBeach",
        "coords": [
          -20.2675,
          148.718
        ],
        "region": "islands"
      }
    ],
    "accommodation": {
      "cardTitle": "Unterkunft Airlie Beach",
      "rawHtml": "<strong>Coral Sea Vista Apartments:</strong> 02.04. – 05.04. (3 Nächte)",
      "name": "Coral Sea Vista Apartments: 02.04. – 05.04.",
      "location": "3 Nächte",
      "nights": 1,
      "bookingLink": "https://www.booking.com/hotel/au/coral-sea-vista-apartments.de.html",
      "bookingLabel": "Booking.com Link",
      "mapsLink": "",
      "mapsLabel": "Hotel Standort",
      "costEur": 119,
      "status": "booked",
      "hasSubcard": true
    },
    "budgetItems": [
      {
        "title": "Coral Sea Vista Whitsundays (110 €) + Heli-Rundflug (220 €)",
        "costEur": 330,
        "status": "planned",
        "statusText": "Geplant",
        "costFormatted": "330 €"
      }
    ],
    "dayBadge": "TAG 13 · AIRLIE BEACH",
    "dateBadge": "02. APRIL (Fr)",
    "driveIcon": "fa-helicopter",
    "expandTrigger": "Details & Hotel",
    "flightInfo": null,
    "hasBudgetSubcard": true,
    "budgetCardTitle": "Budget & Kosten",
    "suggestions": {
      "date": "2027-04-02",
      "title": "Ideen für Airlie Beach Verschlüsselt"
    }
  },
  {
    "dayNumber": 14,
    "date": "2027-04-03",
    "dayOfWeek": "Sa",
    "title": "Whitsundays Highlight-Tag",
    "routeBadge": "Katamaran Bootstour",
    "transportType": "ferry",
    "highlights": [
      "🏝️ Whitehaven Beach",
      "🚁 Heart Reef & Hill Inlet"
    ],
    "summary": "Ganztägige Katamaran-Tour zu den Whitsunday Islands: Traumstrand Whitehaven Beach, Hill Inlet Lookout (Sandwirbel) & Schnorcheln am Great Barrier Reef.",
    "activities": [
      {
        "time": "08:00",
        "title": "Boarding Katamaran-Segeltour ab Coral Sea Marina"
      },
      {
        "time": "11:30",
        "title": "Wanderung zum weltberühmten Hill Inlet Aussichtspunkt"
      },
      {
        "time": "13:00",
        "title": "Strandzeit & Schnorcheln am Whitehaven Beach"
      },
      {
        "time": "17:30",
        "title": "Rückkehr nach Airlie Beach & Sundowner Drinks"
      }
    ],
    "sights": [
      {
        "id": "spot-18",
        "spotId": 18,
        "name": "Hill Inlet Lookout & Whitehaven Beach",
        "highlight": "Wirbelnde weiße Sandbänke bei Ebbe und der feinste Quarzsandstrand der Erde.",
        "photoSpot": "Foto-Spot &amp; Zeit: Mittlere Aussichtsplattform des Hill Inlet Lookout – der klassische Panoramablick auf die Sandmuster.",
        "photoTime": "",
        "directions": "Ganztägiger Katamaran- oder Segeltrip ab Coral Sea Marina.",
        "mapsUrl": "https://maps.google.com/?q=Hill%2BInlet%2BLookout%2BWhitsundays",
        "coords": [
          -20.285,
          149.038
        ],
        "region": "islands"
      }
    ],
    "accommodation": {
      "cardTitle": "Hotel & Unterkunft",
      "name": "Coral Sea Vista Apartments",
      "location": "Airlie Beach (QLD)",
      "nights": 1,
      "bookingLink": "https://www.booking.com/hotel/au/coral-sea-vista-apartments.de.html",
      "bookingLabel": "Booking.com Buchung",
      "mapsLink": "",
      "mapsLabel": "Hotel Standort",
      "costEur": 119,
      "status": "booked",
      "hasSubcard": false
    },
    "budgetItems": [
      {
        "title": "Whitsundays Segeltour & Whitehaven Beach",
        "costEur": 145,
        "status": "planned",
        "statusText": "Geplant",
        "costFormatted": "145 €"
      }
    ],
    "dayBadge": "TAG 14 · WHITSUNDAYS",
    "dateBadge": "03. APRIL (Sa)",
    "driveIcon": "fa-ship",
    "expandTrigger": "Details & Ausflug",
    "flightInfo": null,
    "hasBudgetSubcard": false,
    "budgetCardTitle": "Budget & Kosten",
    "suggestions": {
      "date": "2027-04-03",
      "title": "Ideen &amp; Vorschläge für Tag 14 Verschlüsselt"
    }
  },
  {
    "dayNumber": 15,
    "date": "2027-04-04",
    "dayOfWeek": "So",
    "title": "Airlie Beach & Umgebung (Cedar Creek Falls / Boardwalk)",
    "routeBadge": "Entspannte Tagesausflüge",
    "transportType": "car",
    "highlights": [
      "🌿 Cedar Creek Falls Naturpool",
      "🌴 Conway Nationalpark Regenwald"
    ],
    "summary": "Entspannter Tag in Airlie Beach: Ausflug zu den natürlichen Rockpools der <i>Cedar Creek Falls</i> im Regenwald, Spaziergang auf dem Bicentennial Boardwalk & Sundowner am Yachthafen.",
    "activities": [
      {
        "time": "10:00",
        "title": "Ausflug & Erfrischungsbad bei den Cedar Creek Falls"
      },
      {
        "time": "14:00",
        "title": "Chillen an der kostenfreien Airlie Beach Lagoon"
      },
      {
        "time": "18:00",
        "title": "Sunset Seafood Dinner am Hafen"
      }
    ],
    "sights": [
      {
        "id": "spot-19",
        "spotId": 19,
        "name": "Cedar Creek Falls & Conway Nationalpark",
        "highlight": "Natürlicher Süßwasser-Wasserfall mit Badelagune mitten im tropischen Regenwald.",
        "photoSpot": "Foto-Spot &amp; Zeit: Von den glatten Felsblöcken am Rand des Schwimmbeckens mit Blick direkt in den Wasserfallkessel. (🌿 Vormittags (Weiches Waldlicht))",
        "photoTime": "",
        "directions": "Ca. 25 Min. Autofahrt/Shuttle südwestlich von Airlie Beach.",
        "mapsUrl": "https://maps.google.com/?q=Cedar%2BCreek%2BFalls%2BQueensland",
        "coords": [
          -20.407,
          148.694
        ],
        "region": "islands"
      }
    ],
    "accommodation": {
      "cardTitle": "Hotel & Unterkunft",
      "name": "Coral Sea Vista Apartments",
      "location": "Airlie Beach (QLD)",
      "nights": 1,
      "bookingLink": "https://www.booking.com/hotel/au/coral-sea-vista-apartments.de.html",
      "bookingLabel": "Booking.com Buchung",
      "mapsLink": "",
      "mapsLabel": "Hotel Standort",
      "costEur": 119,
      "status": "booked",
      "hasSubcard": false
    },
    "budgetItems": [
      {
        "title": "Cedar Creek Falls & Entspannung Whitsundays",
        "costEur": 50,
        "status": "planned",
        "statusText": "Geplant",
        "costFormatted": "50 €"
      }
    ],
    "dayBadge": "TAG 15 · WHITSUNDAYS & HINTERLAND",
    "dateBadge": "04. APRIL (So)",
    "driveIcon": "fa-car",
    "expandTrigger": "Details",
    "flightInfo": null,
    "hasBudgetSubcard": false,
    "budgetCardTitle": "Budget & Kosten",
    "suggestions": {
      "date": "2027-04-04",
      "title": "Ideen &amp; Vorschläge für Tag 15 Verschlüsselt"
    }
  },
  {
    "dayNumber": 16,
    "date": "2027-04-05",
    "dayOfWeek": "Mo",
    "title": "Airlie Beach - Flug nach Melbourne",
    "routeBadge": "Flug PPP → MEL: ca. 3 Std.",
    "transportType": "plane",
    "highlights": [
      "✈️ Flug Proserpine → Melbourne",
      "🏙️ Southbank & Yarra River Promenade"
    ],
    "summary": "Flug von Proserpine (PPP) nach Melbourne (MEL). Check-in in den Docklands und erster Abend am beleuchteten Yarra River, Federation Square & Southbank.",
    "activities": [
      {
        "time": "08:30",
        "title": "Transfer zum Whitsunday Coast Airport (PPP)"
      },
      {
        "time": "11:15",
        "title": "Flug Jetstar JQ 843 direkt nach Melbourne (MEL)"
      },
      {
        "time": "15:00",
        "title": "Check-in Hotel The Sebel Melbourne Docklands"
      },
      {
        "time": "18:00",
        "title": "Spaziergang am Yarra River &amp; Dinner in Southbank"
      }
    ],
    "sights": [
      {
        "id": "spot-20",
        "spotId": 20,
        "name": "Melbourne Southbank & Yarra River",
        "highlight": "Lebendige Uferpromenade mit Wolkenkratzer-Kulisse, Straßenmusik und Kulturzentren.",
        "photoSpot": "Foto-Spot &amp; Zeit: Evan Walker Bridge oder Princes Bridge mit Blick nach Westen über den spiegelnden Fluss und die erleuchtete Skyline.",
        "photoTime": "",
        "directions": "Kostenlose City Circle Tram (Linie 35) direkt ab Docklands.",
        "mapsUrl": "https://maps.google.com/?q=Southbank%2BPromenade%2BMelbourne",
        "coords": [
          -37.8205,
          144.964
        ],
        "region": "melbourne"
      }
    ],
    "accommodation": {
      "cardTitle": "Unterkunft Melbourne",
      "rawHtml": "<strong>Vibe Hotel Docklands:</strong> 05.04. – 09.04. (4 Nächte)",
      "name": "Vibe Hotel Docklands: 05.04. – 09.04.",
      "location": "4 Nächte",
      "nights": 1,
      "bookingLink": "https://vibehotels.com",
      "bookingLabel": "Hotel Website",
      "mapsLink": "",
      "mapsLabel": "Hotel Standort",
      "costEur": 119,
      "status": "booked",
      "hasSubcard": true
    },
    "budgetItems": [
      {
        "title": "Inlandsflug PPP → MEL (140 €) + Vibe Hotel (95 €)",
        "costEur": 235,
        "status": "planned",
        "statusText": "Geplant",
        "costFormatted": "235 €"
      }
    ],
    "dayBadge": "TAG 16 · MELBOURNE",
    "dateBadge": "05. APRIL (Mo)",
    "driveIcon": "fa-plane",
    "expandTrigger": "Details & Hotel",
    "flightInfo": {
      "title": "Fluginformationen",
      "details": "Jetstar - Economy Class - Airbus A320 - JQ 843 / Abflug um 11:15 Uhr",
      "statusText": "Flug gebucht & bezahlt (135 € p.P.)"
    },
    "hasBudgetSubcard": false,
    "budgetCardTitle": "Budget & Kosten",
    "suggestions": {
      "date": "2027-04-05",
      "title": "Ideen & Vorschläge für Melbourne Verschlüsselt"
    }
  },
  {
    "dayNumber": 17,
    "date": "2027-04-06",
    "dayOfWeek": "Di",
    "title": "Melbourne – Laneways, Street Art & Pinguine",
    "routeBadge": "ÖPNV / Tram",
    "transportType": "train",
    "highlights": [
      "🎨 Hosier Lane & Street Art",
      "🐧 St. Kilda Pier Zwergpinguine"
    ],
    "summary": "Graffiti-Laneways (Hosier Lane, AC/DC Lane), weltberühmte Café-Kultur, Queen Victoria Market, Royal Botanic Gardens. Abends: Sonnenuntergang & Zwergpinguine am St. Kilda Pier.",
    "activities": [
      {
        "time": "09:30",
        "title": "Kulinarischer Rundgang über den Queen Victoria Market"
      },
      {
        "time": "14:00",
        "title": "Laneway-Bummel, Vintage & Flat Whites in der Degraves Street"
      },
      {
        "time": "18:00",
        "title": "Sonnenuntergang & Pinguine beobachten am St. Kilda Pier"
      }
    ],
    "sights": [
      {
        "id": "spot-21",
        "spotId": 21,
        "name": "Hosier Lane & Laneways",
        "highlight": "Melbournes bekannteste Street-Art-Gassen und das pulsierende Zentrum der Kaffeekultur.",
        "photoSpot": "Foto-Spot &amp; Zeit: Kreuzungsbereich Hosier Lane / Rutledge Lane – Blickwinkel von weit unten nach oben, um die beidseitige Wandhöhe einzufangen.",
        "photoTime": "",
        "directions": "Gegenüber der Flinders Street Station (Free Tram Zone).",
        "mapsUrl": "https://maps.google.com/?q=Hosier%2BLane%2BMelbourne",
        "coords": [
          -37.8163,
          144.969
        ],
        "region": "melbourne"
      },
      {
        "id": "spot-22",
        "spotId": 22,
        "name": "St. Kilda Pier (Zwergpinguin-Kolonie)",
        "highlight": "Wilde Kolonie von Zwergpinguinen, die abends am Wellenbrecher an Land kommen.",
        "photoSpot": "Foto-Spot &amp; Zeit: Am Ende des Holzstegs vor dem Kiosk mit Blick auf die Felsbrocken und den Sonnenuntergang über Port Phillip Bay.",
        "photoTime": "",
        "directions": "Tram 16 oder 96 ab Innenstadt direkt bis St Kilda Beach.",
        "mapsUrl": "https://maps.google.com/?q=St%2BKilda%2BPier%2BMelbourne",
        "coords": [
          -37.8645,
          144.968
        ],
        "region": "melbourne"
      }
    ],
    "accommodation": {
      "cardTitle": "Hotel & Unterkunft",
      "name": "Vibe Hotel Melbourne Docklands",
      "location": "Melbourne Docklands (VIC)",
      "nights": 1,
      "bookingLink": "https://vibehotels.com",
      "bookingLabel": "Vibe Hotel Website",
      "mapsLink": "",
      "mapsLabel": "Hotel Standort",
      "costEur": 119,
      "status": "booked",
      "hasSubcard": false
    },
    "budgetItems": [
      {
        "title": "Vibe Hotel Melbourne (95 €) + Cafés & Pinguine (30 €)",
        "costEur": 125,
        "status": "planned",
        "statusText": "Geplant",
        "costFormatted": "125 €"
      }
    ],
    "dayBadge": "TAG 17 · MELBOURNE",
    "dateBadge": "06. APRIL (Di)",
    "driveIcon": "fa-train-subway",
    "expandTrigger": "Details & Spots",
    "flightInfo": null,
    "hasBudgetSubcard": false,
    "budgetCardTitle": "Budget & Kosten",
    "suggestions": {
      "date": "2027-04-06",
      "title": "Ideen &amp; Vorschläge für Tag 17 Verschlüsselt"
    }
  },
  {
    "dayNumber": 18,
    "date": "2027-04-07",
    "dayOfWeek": "Mi",
    "title": "Tagesausflug Great Ocean Road",
    "routeBadge": "Great Ocean Road: ca. 6 - 7 Std.",
    "transportType": "car",
    "highlights": [
      "🌊 Twelve Apostles & Loch Ard Gorge",
      "🐨 Kennett River Wilde Koalas"
    ],
    "summary": "Fahrt entlang einer der spektakulärsten Küstenstraßen der Welt: Bells Beach, Memorial Arch, Koalas in Kennett River, Twelve Apostles, Loch Ard Gorge und Gibson Steps.",
    "activities": [
      {
        "time": "07:00",
        "title": "Frühstart ab Melbourne auf die legendäre Great Ocean Road"
      },
      {
        "time": "10:00",
        "title": "Fotostopp am Memorial Arch & Bells Beach"
      },
      {
        "time": "12:30",
        "title": "Koalas sichten am Kennett River"
      },
      {
        "time": "14:30",
        "title": "Ankunft bei den Twelve Apostles & Loch Ard Gorge"
      },
      {
        "time": "20:30",
        "title": "Rückkehr nach Melbourne"
      }
    ],
    "sights": [
      {
        "id": "spot-23",
        "spotId": 23,
        "name": "Twelve Apostles & Loch Ard Gorge",
        "highlight": "Monumentale Kalksteinfelsen im tosenden Ozean und dramatische Klippenschlucht.",
        "photoSpot": "Foto-Spot &amp; Zeit: Haupt-Viewing-Platform (Boardwalk Ostseite) für den Blick entlang der Felsnadeln gegen das warme Gegenlicht.",
        "photoTime": "",
        "directions": "Great Ocean Road (B100), geführte Tour oder Mietwagen.",
        "mapsUrl": "https://maps.google.com/?q=Twelve%2BApostles%2BVictoria",
        "coords": [
          -38.6655,
          143.104
        ],
        "region": "melbourne"
      },
      {
        "id": "spot-24",
        "spotId": 24,
        "name": "Kennett River (Wilde Koalas)",
        "highlight": "Eine der besten Stellen Australiens für wilde Koalas in den Eukalyptusbäumen.",
        "photoSpot": "Foto-Spot &amp; Zeit: Die ersten 400 Meter der Grey River Road – Blick in die Astgabeln der Manna-Gumbäume.",
        "photoTime": "",
        "directions": "Stopp an der Grey River Road zwischen Lorne und Apollo Bay.",
        "mapsUrl": "https://maps.google.com/?q=Kennett%2BRiver%2BKoala%2BWalk",
        "coords": [
          -38.673,
          143.864
        ],
        "region": "melbourne"
      }
    ],
    "accommodation": {
      "cardTitle": "Hotel & Unterkunft",
      "name": "Vibe Hotel Melbourne Docklands",
      "location": "Melbourne Docklands (VIC)",
      "nights": 1,
      "bookingLink": "https://vibehotels.com",
      "bookingLabel": "Vibe Hotel Website",
      "mapsLink": "",
      "mapsLabel": "Hotel Standort",
      "costEur": 119,
      "status": "booked",
      "hasSubcard": false
    },
    "budgetItems": [
      {
        "title": "Great Ocean Road Tagestour & Mietwagen Sprit",
        "costEur": 70,
        "status": "planned",
        "statusText": "Geplant",
        "costFormatted": "70 €"
      }
    ],
    "dayBadge": "TAG 18 · GREAT OCEAN ROAD",
    "dateBadge": "07. APRIL (Mi)",
    "driveIcon": "fa-car",
    "expandTrigger": "Details & Ausflug",
    "flightInfo": null,
    "hasBudgetSubcard": false,
    "budgetCardTitle": "Budget & Kosten",
    "suggestions": {
      "date": "2027-04-07",
      "title": "Ideen &amp; Vorschläge für Tag 18 Verschlüsselt"
    }
  },
  {
    "dayNumber": 19,
    "date": "2027-04-08",
    "dayOfWeek": "Do",
    "title": "Melbourne – Brighton Boxes & Fitzroy / Ausklang",
    "routeBadge": "Kultur / Stadt",
    "transportType": "train",
    "highlights": [
      "🏖️ Brighton Bathing Boxes",
      "☕ Fitzroy & Brunswick Street"
    ],
    "summary": "Bunte Brighton Bathing Boxes am Strand, Vintage-Bummel im Trendviertel Fitzroy & Brunswick, National Gallery of Victoria (NGV) und Abschieds-Dinner auf einer Rooftop-Bar.",
    "activities": [
      {
        "time": "10:00",
        "title": "Fotostopp & Strandspaziergang bei den Brighton Bathing Boxes"
      },
      {
        "time": "14:00",
        "title": "Vintage-Shopping & Cafés in Fitzroy"
      },
      {
        "time": "19:30",
        "title": "Großes Abschlussdinner auf einer Rooftop-Bar mit Skylineblick"
      }
    ],
    "sights": [
      {
        "id": "spot-25",
        "spotId": 25,
        "name": "Brighton Bathing Boxes",
        "highlight": "82 bunte historische Badehäuschen direkt am Strand mit Skyline-Blick im Hintergrund.",
        "photoSpot": "Foto-Spot &amp; Zeit: Auf Höhe von Box 1 Fluchtlinie schräg entlang der Kanten mit der fernen Melbourne-Skyline im Hintergrund.",
        "photoTime": "",
        "directions": "Metro Sandringham Line bis Brighton Beach Station (ca. 25 Min.).",
        "mapsUrl": "https://maps.google.com/?q=Brighton%2BBathing%2BBoxes",
        "coords": [
          -37.9175,
          144.985
        ],
        "region": "melbourne"
      },
      {
        "id": "spot-26",
        "spotId": 26,
        "name": "Fitzroy (Brunswick & Gertrude Street)",
        "highlight": "Kreatives Hipster-Viertel mit Vintage-Stores, Plattenläden und Rooftop-Bars.",
        "photoSpot": "Foto-Spot &amp; Zeit: Von einer der Rooftop-Terrassen (z. B. Naked for Satan) mit Panoramablick auf die Dächer und die City-Skyline.",
        "photoTime": "",
        "directions": "Tram 11 oder 96 direkt ab City bis Brunswick Street.",
        "mapsUrl": "https://maps.google.com/?q=Brunswick%2BStreet%2BFitzroy%2BMelbourne",
        "coords": [
          -37.7985,
          144.9785
        ],
        "region": "melbourne"
      }
    ],
    "accommodation": {
      "cardTitle": "Hotel & Unterkunft",
      "name": "Vibe Hotel Melbourne Docklands",
      "location": "Melbourne Docklands (VIC)",
      "nights": 1,
      "bookingLink": "https://vibehotels.com",
      "bookingLabel": "Vibe Hotel Website",
      "mapsLink": "",
      "mapsLabel": "Hotel Standort",
      "costEur": 119,
      "status": "booked",
      "hasSubcard": false
    },
    "budgetItems": [
      {
        "title": "Melbourne Brighton Beach & Fitzroy Rooftop",
        "costEur": 65,
        "status": "planned",
        "statusText": "Geplant",
        "costFormatted": "65 €"
      }
    ],
    "dayBadge": "TAG 19 · MELBOURNE & OCEAN ROAD",
    "dateBadge": "08. APRIL (Do)",
    "driveIcon": "fa-train",
    "expandTrigger": "Details",
    "flightInfo": null,
    "hasBudgetSubcard": false,
    "budgetCardTitle": "Budget & Kosten",
    "suggestions": {
      "date": "2027-04-08",
      "title": "Ideen &amp; Vorschläge für Tag 19 Verschlüsselt"
    }
  },
  {
    "dayNumber": 20,
    "date": "2027-04-09",
    "dayOfWeek": "Fr",
    "title": "Rückflug nach Wien",
    "routeBadge": "Rückflug MEL → VIE",
    "transportType": "plane",
    "highlights": [
      "🌿 Royal Botanic Gardens Victoria",
      "✈️ Heimflug Melbourne → Wien"
    ],
    "summary": "Letzter Aussie-Flat-White am Morgen, Transfer zum Flughafen Melbourne Tullamarine (MEL) und Rückflug nach Wien. Ende eines unvergesslichen Abenteuers!",
    "activities": [
      {
        "time": "10:00",
        "title": "Gemütliches letztes australisches Brekkie & Souvenirs packen"
      },
      {
        "time": "13:00",
        "title": "Check-out & Transfer zum Flughafen Melbourne Tullamarine (MEL)"
      },
      {
        "time": "16:30",
        "title": "Heimflug Scoot TR 19 nach Singapur & Weiterflug nach Wien"
      }
    ],
    "sights": [
      {
        "id": "spot-27",
        "spotId": 27,
        "name": "Royal Botanic Gardens Victoria",
        "highlight": "Eine der prachtvollsten Parkanlagen der Welt mit 8.500 Pflanzenarten und Ruheoasen.",
        "photoSpot": "Foto-Spot &amp; Zeit: Am Ufer des Ornamental Lake mit der spiegelnden Trauerweide und den Seerosen.",
        "photoTime": "",
        "directions": "10 Min. Fußweg südlich von Federation Square über die Princes Bridge.",
        "mapsUrl": "https://maps.google.com/?q=Royal%2BBotanic%2BGardens%2BVictoria%2BMelbourne",
        "coords": [
          -37.8304,
          144.98
        ],
        "region": "melbourne"
      }
    ],
    "accommodation": {
      "cardTitle": "Hotel & Unterkunft",
      "name": "Rückflug nach Wien (Scoot TR 25)",
      "location": "Flughafen / Rückflug",
      "nights": 1,
      "bookingLink": "",
      "bookingLabel": "Flug TR 25 gebucht",
      "mapsLink": "",
      "mapsLabel": "Hotel Standort",
      "costEur": 119,
      "status": "booked",
      "hasSubcard": false
    },
    "budgetItems": [
      {
        "title": "Royal Botanic Gardens & Airport Transfer",
        "costEur": 45,
        "status": "planned",
        "statusText": "Geplant",
        "costFormatted": "45 €"
      }
    ],
    "dayBadge": "TAG 20 · MELBOURNE → WIEN",
    "dateBadge": "09. APRIL (Fr)",
    "driveIcon": "fa-plane",
    "expandTrigger": "Details",
    "flightInfo": null,
    "hasBudgetSubcard": true,
    "budgetCardTitle": "Budget & Kosten",
    "suggestions": {
      "date": "2027-04-09",
      "title": "Notizen zur Abreise Verschlüsselt"
    }
  }
];

  let tripDays = [];
  let isLoaded = false;
  let rawMasterState = null;

  // Helper: Deep Clone
  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Helper: Event-Bus Notify
  function notify(event, payload) {
    if (listeners.has(event)) {
      listeners.get(event).forEach(cb => {
        try { cb(payload); } catch (e) { console.error('[TripStore Listener Error (' + event + ')]:', e); }
      });
    }
    if (listeners.has('*')) {
      listeners.get('*').forEach(cb => {
        try { cb({ event, payload }); } catch (e) { console.error('[TripStore Wildcard Error]:', e); }
      });
    }
  }

  // Helper: Escape HTML
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // 1. Data Loader with file:// and offline fallback
  async function loadTripDays() {
    let loadedData = null;

    // A. Attempt async fetch from data/trip-days.json
    try {
      if (typeof fetch === 'function') {
        const response = await fetch('data/trip-days.json', { cache: 'no-cache' });
        if (response.ok) {
          loadedData = await response.json();
          console.info('[TripStore] ✓ Successfully loaded 20 travel days from data/trip-days.json via fetch()');
        } else {
          console.warn('[TripStore] Fetch returned status ' + response.status + ', checking fallbacks...');
        }
      }
    } catch (fetchErr) {
      console.warn('[TripStore] Asynchronous fetch failed (likely file:// CORS restrictions or offline):', fetchErr.message);
    }

    // B. Check window.FALLBACK_TRIP_DAYS if provided
    if (!loadedData && typeof window !== 'undefined' && Array.isArray(window.FALLBACK_TRIP_DAYS)) {
      console.info('[TripStore] Using window.FALLBACK_TRIP_DAYS fallback');
      loadedData = deepClone(window.FALLBACK_TRIP_DAYS);
    }

    // C. Use embedded fallback data
    if (!loadedData) {
      console.info('[TripStore] Using embedded offline fallback data (20 days)');
      loadedData = deepClone(FALLBACK_TRIP_DAYS);
    }

    // D. Migrate any local user modifications (custom activities)
    tripDays = loadedData;
    isLoaded = true;

    // Check localStorage overrides
    if (typeof localStorage !== 'undefined') {
      try {
        const storedActs = localStorage.getItem('aus_roadtrip_custom_activities_2027');
        if (storedActs) {
          const parsed = JSON.parse(storedActs);
          Object.keys(parsed).forEach(dayNum => {
            const day = tripDays.find(d => d.dayNumber === parseInt(dayNum, 10));
            if (day && Array.isArray(parsed[dayNum])) {
              parsed[dayNum].forEach(ca => {
                const exists = day.activities.some(a => a.title === ca.title && a.time === ca.time);
                if (!exists) {
                  day.activities.push({
                    time: ca.time || '12:00',
                    title: ca.title || ca.note || 'Aktivität'
                  });
                }
              });
            }
          });
        }
      } catch (e) {
        console.warn('[TripStore] Could not merge localStorage activities:', e);
      }
    }

    notify('days:loaded', tripDays);
    return tripDays;
  }

  // 2. Timeline Accordion HTML Renderers
  function renderSights(sights) {
    if (!sights || sights.length === 0) return '';
    const cardsHtml = sights.map(s => {
      const spotNum = s.spotId || parseInt(String(s.id).replace('spot-', ''), 10) || 0;
      return `
        <div class="sight-detail-card" id="spot-card-${spotNum}" data-spot-id="${spotNum}">
          <div class="sight-header">
            <h4 class="sight-name">${s.name}</h4>
            <button type="button" class="btn-maps-mini btn-unified-map-link"
              onclick="focusSpotOnMap(${spotNum}, event)"
              style="background: rgba(0, 109, 104, 0.12); color: var(--primary); border: 1px solid rgba(0, 109, 104, 0.25); cursor: pointer;"
              title="Diesen Spot auf der Karte zentrieren"><i class="fa-solid fa-map-pin"></i> Auf Karte</button>
          </div>
          <div class="sight-detail-body">
            <div class="sight-fact">
              <span class="sight-label"><i class="fa-solid fa-star"></i> Was macht es besonders:</span>
              <p>${s.highlight}</p>
            </div>
            <div class="photo-spot-box">
              <i class="fa-solid fa-camera"></i>
              <div><strong>Foto-Spot &amp; Zeit:</strong> ${s.photoSpot} ${s.photoTime ? `<span style="font-weight:700; color:var(--primary); font-size:0.78rem;">(${s.photoTime})</span>` : ''}</div>
            </div>
            <div class="sight-fact">
              <span class="sight-label"><i class="fa-solid fa-route"></i> Wie man am besten hinkommt:</span>
              <p>${s.directions}</p>
            </div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="day-plan-section-title"><i class="fa-solid fa-camera"></i> Sightseeing-Highlights &amp; Fotospots</div>
      <div class="sight-detail-grid">
        ${cardsHtml}
      </div>
    `;
  }

  function renderActivities(activities, dayNumber) {
    const actsHtml = (activities || []).map(a => `
      <div class="activity-row">
        <span class="activity-time">${escapeHtml(a.time)}</span>
        <span class="activity-desc">${escapeHtml(a.title)}</span>
      </div>
    `).join('');

    return `
      <div class="day-plan-section-title"><i class="fa-solid fa-clock"></i> Zeitplanung &amp; Aktivitäten</div>
      <div class="activity-timeline" id="act-list-day-${dayNumber}">
        ${actsHtml}
      </div>
    `;
  }

  function renderActivityForm(dayNumber) {
    return `
      <div class="activity-inline-form">
        <input type="time" class="act-time-input" id="act-time-day-${dayNumber}"
          aria-label="Uhrzeit für neue Aktivität">
        <input type="text" class="act-desc-input" id="act-desc-day-${dayNumber}"
          placeholder="Neue Aktivität eintragen (z. B. 15:30 Eis essen)..."
          onkeypress="if(event.key==='Enter') addCustomActivity(${dayNumber})">
        <button type="button" class="btn-act-add" onclick="addCustomActivity(${dayNumber})"
          title="Aktivität für Tag ${dayNumber} hinzufügen">
          <i class="fa-solid fa-plus"></i> Hinzufügen
        </button>
      </div>
    `;
  }

  function renderFlightSubcard(flightInfo) {
    if (!flightInfo) return '';
    return `
      <div class="day-subcard hotel">
        <div class="subcard-title"><i class="fa-solid fa-plane"></i> ${escapeHtml(flightInfo.title || 'Fluginformationen')}</div>
        <p><strong>${escapeHtml(flightInfo.details)}</strong></p>
        <span class="status-pill paid" style="margin-top:0.4rem; display:inline-block;"><i class="fa-solid fa-check"></i> ${escapeHtml(flightInfo.statusText || 'Flug gebucht & bezahlt')}</span>
      </div>
    `;
  }

  function renderHotelSubcard(acc) {
    if (!acc || !acc.hasSubcard) return '';
    return `
      <div class="day-subcard hotel">
        <div class="subcard-title"><i class="fa-solid fa-bed"></i> ${escapeHtml(acc.cardTitle || 'Hotel &amp; Unterkunft')}</div>
        <p>${acc.rawHtml || (`<strong>${escapeHtml(acc.name)}</strong> (${escapeHtml(acc.location)}) – ${acc.nights} Nächte gebucht`)}</p>
        ${acc.bookingLink ? `<a href="${escapeHtml(acc.bookingLink)}" target="_blank" class="btn-action btn-booking"><i class="fa-solid fa-hotel"></i> ${escapeHtml(acc.bookingLabel || 'Hotel Website')}</a>` : ''}
        ${acc.mapsLink ? `<a href="${escapeHtml(acc.mapsLink)}" target="_blank" class="btn-action btn-maps"><i class="fa-solid fa-map-location-dot"></i> ${escapeHtml(acc.mapsLabel || 'Hotel Standort')}</a>` : ''}
      </div>
    `;
  }

  function renderBudgetSubcard(budgetItems, day) {
    if (!day.hasBudgetSubcard || !budgetItems || budgetItems.length === 0) return '';
    const itemsHtml = budgetItems.map(b => `
      <li><span>${escapeHtml(b.title)}:</span> <strong>${escapeHtml(b.costFormatted || (b.costEur + ' €'))}</strong> <span class="status-pill ${escapeHtml(b.status)}">${escapeHtml(b.statusText || (b.status === 'paid' ? 'Bezahlt' : 'Geplant'))}</span></li>
    `).join('');

    return `
      <div class="day-subcard budget">
        <div class="subcard-title"><i class="fa-solid fa-wallet"></i> ${escapeHtml(day.budgetCardTitle || 'Budget &amp; Kosten')}</div>
        <ul class="sub-item-list">
          ${itemsHtml}
        </ul>
      </div>
    `;
  }

  function renderSuggestionsSubcard(suggestions, date, dayNumber) {
    const title = suggestions && suggestions.title ? suggestions.title : `Ideen & Vorschläge für Tag ${dayNumber}`;
    return `
      <div class="day-subcard suggestions" data-day="${escapeHtml(date)}">
        <div class="subcard-title"><i class="fa-solid fa-lightbulb" style="color:var(--accent-gold);"></i> ${escapeHtml(title)} <span class="sync-badge" style="margin-left:auto;"><span class="sync-dot"></span> Verschlüsselt</span></div>
        <div class="sug-input-row">
          <input type="text" class="sug-text-input" placeholder="Vorschlag machen..."
            onkeypress="if(event.key==='Enter') addSuggestion('${escapeHtml(date)}', this)">
          <select class="sug-author-select">
            <option>Tobi</option>
            <option>Lara</option>
            <option>Ker</option>
            <option>Flo</option>
          </select>
          <button class="sug-btn-add" onclick="triggerAddSuggestion('${escapeHtml(date)}', this)"><i class="fa-solid fa-plus"></i></button>
        </div>
        <ul class="sug-list" id="sug-list-${escapeHtml(date)}"></ul>
      </div>
    `;
  }

  function renderDayItem(day) {
    const chipsHtml = (day.highlights || []).map(h => `<span class="compact-highlight-chip">${escapeHtml(h)}</span>`).join('\n                      ');
    const driveIconClass = day.driveIcon && day.driveIcon.startsWith('fa-') ? day.driveIcon : ('fa-' + (day.driveIcon || 'car'));

    return `
      <details class="timeline-item" id="day-${day.dayNumber}">
        <summary class="timeline-summary">
          <div class="summary-header-row">
            <div class="timeline-header-badges">
              <span class="timeline-day-badge">${escapeHtml(day.dayBadge || ('TAG ' + day.dayNumber))}</span>
              <span class="date-badge">${escapeHtml(day.dateBadge || day.date)}</span>
              <span class="drive-badge"><i class="fa-solid ${driveIconClass}"></i> ${escapeHtml(day.routeBadge)}</span>
            </div>
            <button type="button" class="btn-day-map-link btn-unified-map-link"
              onclick="focusDayOnMap(${day.dayNumber}, event)" title="Tag ${day.dayNumber} auf der Karte zentrieren &amp; Route anzeigen"><i
                class="fa-solid fa-map-location-dot"></i> Auf Karte</button>
            <span class="expand-trigger"><i class="fa-solid fa-chevron-down"></i> ${escapeHtml(day.expandTrigger || 'Details')}</span>
          </div>
          <h3 class="timeline-title">${escapeHtml(day.title)}</h3>
          <div class="timeline-compact-highlights">
            ${chipsHtml}
          </div>
        </summary>
        <div class="timeline-body">
          <div class="day-subcard">
            <div class="subcard-title"><i class="fa-solid fa-circle-info"></i> Tagesprogramm</div>
            <p>${escapeHtml(day.summary)}</p>
          </div>

          <details class="day-plan-accordion">
            <summary class="day-plan-summary">
              <span><i class="fa-solid fa-list-check"></i> Detaillierter Tagesplan &amp; Spots</span>
              <span class="plan-toggle-badge">Details ansehen <i class="fa-solid fa-chevron-down"></i></span>
            </summary>
            <div class="day-plan-content">
              ${renderSights(day.sights)}
              ${renderActivities(day.activities, day.dayNumber)}
              ${renderActivityForm(day.dayNumber)}
            </div>
          </details>

          ${renderFlightSubcard(day.flightInfo)}
          ${renderHotelSubcard(day.accommodation)}
          ${renderBudgetSubcard(day.budgetItems, day)}
          ${renderSuggestionsSubcard(day.suggestions, day.date, day.dayNumber)}
        </div>
      </details>
    `;
  }

  // 3. Render Timeline into Container
  function renderTimeline(targetContainer) {
    let container = null;
    if (typeof targetContainer === 'string') {
      container = document.querySelector(targetContainer);
    } else if (targetContainer && (targetContainer.nodeType || typeof targetContainer === 'object')) {
      container = targetContainer;
    } else if (typeof document !== 'undefined') {
      container = document.querySelector('#route .timeline') || document.querySelector('.timeline') || document.getElementById('timeline-container');
    }

    if (!container) {
      console.warn('[TripStore] Target container for timeline not found in DOM');
      return;
    }

    if (!tripDays || tripDays.length === 0) {
      container.innerHTML = `
        <div class="timeline-error-notice" style="padding:2rem; text-align:center; background:var(--card-bg); border-radius:12px; border:1px solid var(--border-color);">
          <i class="fa-solid fa-triangle-exclamation" style="font-size:2rem; color:var(--accent-gold); margin-bottom:0.75rem;"></i>
          <h4 style="margin-bottom:0.5rem;">Reisetage konnten nicht geladen werden</h4>
          <p style="font-size:0.88rem; color:var(--text-muted); max-width:480px; margin:0 auto 1rem auto;">
            Beim Öffnen als lokale Datei (<code>file://</code>) blockiert der Browser unter Umständen lokale JSON-Abfragen per <code>fetch()</code>.
          </p>
          <div style="display:inline-block; text-align:left; background:var(--card-sub-bg); padding:0.75rem 1.25rem; border-radius:8px; font-family:monospace; font-size:0.82rem;">
            npm start &nbsp;&nbsp;<em>oder</em>&nbsp;&nbsp; npx serve &nbsp;&nbsp;<em>oder</em>&nbsp;&nbsp; python3 -m http.server
          </div>
        </div>
      `;
      return;
    }

    const htmlContent = tripDays.map(renderDayItem).join('\n');
    container.innerHTML = htmlContent;
    console.info('[TripStore] ✓ Successfully rendered ' + tripDays.length + ' travel day accordions into timeline');

    // Synchronize Timeline with Map
    if (typeof setupTimelineMapSync === 'function') {
      setupTimelineMapSync();
    } else if (typeof window !== 'undefined' && typeof window.setupTimelineMapSync === 'function') {
      window.setupTimelineMapSync();
    } else if (typeof document !== 'undefined') {
      document.querySelectorAll('details.timeline-item').forEach(detailsEl => {
        detailsEl.addEventListener('toggle', () => {
          if (detailsEl.open) {
            const dayNum = parseInt(detailsEl.id.replace('day-', ''), 10);
            if (dayNum && typeof focusDayOnMap === 'function') {
              focusDayOnMap(dayNum, null, false);
            }
          }
        });
      });
    }

    // Scroll reveal classes
    if (typeof document !== 'undefined') {
      document.querySelectorAll('.timeline details.timeline-item').forEach((day, idx) => {
        day.classList.add('scroll-tab');
        day.setAttribute('data-day-idx', idx);
      });
    }

    // Floating UI hooks if active
    if (typeof renderFloatingDaysBar === 'function') renderFloatingDaysBar(1);
    if (typeof renderDayPlanOverlay === 'function') renderDayPlanOverlay(1);

    // Hash jump check
    if (typeof window !== 'undefined' && window.location && window.location.hash) {
      const match = window.location.hash.match(/#(?:day|tag)-(\d+)/i);
      if (match && typeof jumpToDay === 'function') {
        setTimeout(() => jumpToDay(parseInt(match[1], 10)), 150);
      }
    }

    notify('timeline:rendered', tripDays);
  }

  // 4. Store State & CRUD API (Compatible with test suites & interactive UI)
  const TripStore = {
    // State Access
    isLoaded: () => isLoaded,
    getDays: () => deepClone(tripDays),
    getDay: (dayNum) => {
      const day = tripDays.find(d => d.dayNumber === parseInt(dayNum, 10));
      if (!day) return null;
      const res = deepClone(day);
      res.day = res.dayNumber;
      res.spots = res.sights || [];
      res.accommodationDetails = res.accommodation || null;
      return res;
    },
    getActivities: (dayNum) => {
      if (dayNum !== undefined && dayNum !== null) {
        const day = tripDays.find(d => d.dayNumber === parseInt(dayNum, 10));
        return day ? deepClone(day.activities) : [];
      }
      const all = [];
      tripDays.forEach(d => {
        (d.activities || []).forEach(a => all.push(deepClone(a)));
      });
      return all;
    },
    getActivity: (actId) => {
      for (const d of tripDays) {
        const found = (d.activities || []).find(a => a.id === actId);
        if (found) return deepClone(found);
      }
      return null;
    },
    getSpots: (dayNum) => {
      const day = tripDays.find(d => d.dayNumber === parseInt(dayNum, 10));
      return day ? deepClone(day.sights || []) : [];
    },
    getSpot: (spotId) => {
      for (const d of tripDays) {
        const found = (d.sights || []).find(s => s.id === spotId || s.spotId === parseInt(spotId, 10) || s.id === ('spot-' + spotId));
        if (found) return deepClone(found);
      }
      return null;
    },
    getAccommodation: (dayNum) => {
      const day = tripDays.find(d => d.dayNumber === parseInt(dayNum, 10));
      return day ? deepClone(day.accommodation) : null;
    },
    getBudgetItems: (dayNum) => {
      const day = tripDays.find(d => d.dayNumber === parseInt(dayNum, 10));
      return day ? deepClone(day.budgetItems || []) : [];
    },

    // Subscriptions
    subscribe: (event, callback) => {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(callback);
      return () => {
        if (listeners.has(event)) listeners.get(event).delete(callback);
      };
    },

    // CRUD: Activity
    createActivity: (dayNum, actData) => {
      const day = tripDays.find(d => d.dayNumber === parseInt(dayNum, 10));
      if (!day) return null;
      const newAct = {
        id: 'act-d' + dayNum + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
        time: actData.time || '10:00',
        title: actData.title || 'Neue Aktivität',
        category: actData.category || 'sightseeing',
        description: actData.notes || actData.description || ''
      };
      day.activities = day.activities || [];
      day.activities.push(newAct);
      notify('activity:created', newAct);
      notify('activity:changed', { action: 'create', activity: newAct });
      return deepClone(newAct);
    },

    updateActivity: (actId, updates) => {
      for (const d of tripDays) {
        const act = (d.activities || []).find(a => a.id === actId);
        if (act) {
          Object.assign(act, updates);
          notify('activity:updated', act);
          notify('activity:changed', { action: 'update', activity: act });
          return deepClone(act);
        }
      }
      return null;
    },

    deleteActivity: (actId) => {
      for (const d of tripDays) {
        const idx = (d.activities || []).findIndex(a => a.id === actId);
        if (idx !== -1) {
          const removed = d.activities.splice(idx, 1)[0];
          notify('activity:deleted', removed);
          notify('activity:changed', { action: 'delete', activity: removed });
          return true;
        }
      }
      return false;
    },

    // CRUD: Day
    createDay: (dayData) => {
      const nextNum = tripDays.length + 1;
      const newDay = {
        dayNumber: nextNum,
        day: nextNum,
        date: dayData.date || '2027-04-10',
        dayOfWeek: dayData.dayOfWeek || 'Sa',
        title: dayData.title || ('Reisetag ' + nextNum),
        routeBadge: dayData.routeBadge || 'Erkundung vor Ort',
        transportType: dayData.transportType || 'car',
        highlights: dayData.highlights || [],
        summary: dayData.summary || '',
        activities: dayData.activities || [],
        sights: dayData.sights || [],
        accommodation: dayData.accommodation || null,
        budgetItems: dayData.budgetItems || [],
        dayBadge: 'TAG ' + nextNum + ' · ' + (dayData.location || 'AUSTRALIEN').toUpperCase(),
        dateBadge: dayData.date || '',
        driveIcon: 'fa-car',
        expandTrigger: 'Details',
        hasBudgetSubcard: false,
        suggestions: { date: dayData.date || '', title: 'Ideen für Tag ' + nextNum }
      };
      tripDays.push(newDay);
      notify('day:created', newDay);
      return deepClone(newDay);
    },

    updateDay: (dayNum, updates) => {
      const day = tripDays.find(d => d.dayNumber === parseInt(dayNum, 10));
      if (!day) return null;
      Object.assign(day, updates);
      notify('day:updated', day);
      return deepClone(day);
    },

    deleteDay: (dayNum) => {
      const idx = tripDays.findIndex(d => d.dayNumber === parseInt(dayNum, 10));
      if (idx !== -1) {
        const removed = tripDays.splice(idx, 1)[0];
        notify('day:deleted', removed);
        return true;
      }
      return false;
    },

    // CRUD: Spot
    createSpot: (spotData) => {
      const dayNum = parseInt(spotData.day || 1, 10);
      const day = tripDays.find(d => d.dayNumber === dayNum);
      const newId = spotData.id || ('spot-' + Date.now().toString(36));
      const spotObj = {
        id: newId,
        spotId: parseInt(spotData.spotId || (Date.now() % 1000), 10),
        name: spotData.name || 'Neuer Spot',
        highlight: spotData.highlight || '',
        photoSpot: spotData.photoSpot || '',
        photoTime: spotData.photoTime || '',
        directions: spotData.directions || '',
        mapsUrl: spotData.mapsUrl || '',
        coords: spotData.coords || null,
        category: spotData.category || 'Fotospot'
      };
      if (day) {
        day.sights = day.sights || [];
        day.sights.push(spotObj);
      }
      notify('spot:created', spotObj);
      return deepClone(spotObj);
    },

    updateSpot: (spotId, updates) => {
      for (const d of tripDays) {
        const spot = (d.sights || []).find(s => s.id === spotId || s.spotId === parseInt(spotId, 10));
        if (spot) {
          Object.assign(spot, updates);
          notify('spot:updated', spot);
          return deepClone(spot);
        }
      }
      return null;
    },

    deleteSpot: (spotId) => {
      for (const d of tripDays) {
        const idx = (d.sights || []).findIndex(s => s.id === spotId || s.spotId === parseInt(spotId, 10));
        if (idx !== -1) {
          const removed = d.sights.splice(idx, 1)[0];
          notify('spot:deleted', removed);
          return true;
        }
      }
      return false;
    },

    // Export / Import
    exportMasterJSON: () => {
      return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), days: tripDays }, null, 2);
    },

    importMasterJSON: (jsonStr) => {
      try {
        const data = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
        if (Array.isArray(data)) {
          tripDays = data;
        } else if (data && Array.isArray(data.days)) {
          tripDays = data.days;
        }
        notify('days:loaded', tripDays);
        return true;
      } catch (e) {
        console.error('[TripStore] Import failed:', e);
        return false;
      }
    },

    // Render & Initialization
    load: loadTripDays,
    renderTimeline: renderTimeline,
    renderDayItem: renderDayItem,

    init: function (initialData) {
      if (initialData) {
        if (Array.isArray(initialData)) {
          tripDays = deepClone(initialData);
        } else if (initialData.days && Array.isArray(initialData.days)) {
          rawMasterState = deepClone(initialData);
          tripDays = deepClone(FALLBACK_TRIP_DAYS);
        }
        isLoaded = true;
        return this;
      }

      // 1. Initial immediate render from fallback to avoid FOUC / delay
      if (!isLoaded || tripDays.length === 0) {
        tripDays = deepClone(FALLBACK_TRIP_DAYS);
        isLoaded = true;
      }
      renderTimeline();

      // 2. Async revalidate via fetch('data/trip-days.json')
      if (typeof window !== 'undefined') {
        loadTripDays().then((freshDays) => {
          if (JSON.stringify(freshDays) !== JSON.stringify(FALLBACK_TRIP_DAYS)) {
            renderTimeline();
          }
          if (typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
            window.dispatchEvent(new CustomEvent('trip-store:ready', { detail: { days: tripDays } }));
          }
        }).catch(err => {
          console.warn('[TripStore] Offline / file:// active, using loaded days:', err.message);
        });
      }
      return this;
    }
  };

  // Auto-init in browser when DOM is ready or immediately
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        TripStore.init();
      });
    } else {
      TripStore.init();
    }
  }

  return TripStore;
}));
