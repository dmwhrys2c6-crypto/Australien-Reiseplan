/* =========================================================================
   AUSTRALIEN ROADTRIP 2027 – ZENTRALE DATENSTRUKTUR (tripData)
   Einheitliche Source-of-Truth für Tage, Orte, Aktivitäten, Unterkünfte,
   Spots, Budget, Packliste, Drohnendaten & Routen.
   ========================================================================= */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const data = factory();
    Object.assign(root, data);
    root.tripData = data.tripData;
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // 1. ZENTRALES TRIPDATA-ARRAY (Alle 20 Reisetage vollständig aggregiert)
  const tripData = [
  {
    "day": 1,
    "date": "21.03. (So)",
    "title": "Abreise aus Wien",
    "location": "Wien → Sydney (Langstreckenflug)",
    "start": "Flughafen Wien-Schwechat (VIE)",
    "destination": "Sydney Kingsford Smith Airport (SYD)",
    "startCoords": [
      48.1103,
      16.5697
    ],
    "destCoords": [
      -33.9461,
      151.1772
    ],
    "center": [
      -33.8688,
      151.2093
    ],
    "zoom": 6,
    "distance": "ca. 15.900 km",
    "driveTime": "ca. 22–24 Std. Flugzeit",
    "transportType": "flight",
    "accommodation": "Langstreckenflug (Übernachtung an Bord / Flugzeug)",
    "stageRoute": [
      [
        -33.9461,
        151.1772
      ],
      [
        -33.8688,
        151.2093
      ]
    ],
    "activities": [
      "Abreise aus Wien",
      "Langstreckenflug über Singapur (SIN)",
      "Zwischenstopp 3h 15m"
    ],
    "spotIds": [],
    "accommodationDetails": {
      "name": "Langstreckenflug Scoot TR 12",
      "address": "Flughafen Wien (VIE) → Singapur (SIN) → Sydney (SYD)",
      "location": "Flugzeug / Transit",
      "checkIn": "Boarding 09:15 Uhr",
      "checkOut": "Landung 18:50 Uhr (Tag 2)",
      "bookingUrl": "",
      "bookingLabel": "Flug TR 12 gebucht",
      "type": "flight"
    },
    "plannedExpense": {
      "amount": 453,
      "label": "Langstreckenflug Wien → Sydney (gebucht)"
    },
    "spots": []
  },
  {
    "day": 2,
    "date": "22.03. (Mo)",
    "title": "Ankunft in Sydney",
    "location": "Sydney (NSW)",
    "start": "Kingsford Smith Airport (SYD)",
    "destination": "The Ultimo Sydney (Chinatown / Haymarket)",
    "startCoords": [
      -33.9461,
      151.1772
    ],
    "destCoords": [
      -33.8807,
      151.2034
    ],
    "center": [
      -33.875,
      151.202
    ],
    "zoom": 13,
    "distance": "ca. 12 km",
    "driveTime": "ca. 25 Min. Transfer",
    "transportType": "drive",
    "accommodation": "The Ultimo, Sydney (50 Jones St, Ultimo NSW 2007)",
    "stageRoute": [
      [
        -33.9461,
        151.1772
      ],
      [
        -33.91,
        151.185
      ],
      [
        -33.8807,
        151.2034
      ],
      [
        -33.8695,
        151.201
      ]
    ],
    "activities": [
      "Landung 18:50 Uhr",
      "Flughafentransfer",
      "Hotel Check-in",
      "Abendessen Darling Harbour & Barangaroo"
    ],
    "spotIds": [
      1
    ],
    "accommodationDetails": {
      "name": "The Ultimo, Sydney",
      "address": "50 Jones St, Ultimo NSW 2007 (Chinatown / Haymarket)",
      "location": "Sydney (NSW)",
      "checkIn": "ab 14:00 Uhr",
      "checkOut": "bis 11:00 Uhr (am 25.03.)",
      "bookingUrl": "https://www.theultimo.com.au",
      "bookingLabel": "Hotel Website (The Ultimo)",
      "type": "hotel"
    },
    "plannedExpense": {
      "amount": 150,
      "label": "The Ultimo Sydney Hotel & Transfer"
    },
    "spots": [
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
      }
    ]
  },
  {
    "day": 3,
    "date": "23.03. (Di)",
    "title": "Sydney – Klassiker am Hafen & Manly Ferry",
    "location": "Sydney (NSW)",
    "start": "The Ultimo Sydney",
    "destination": "Circular Quay & Manly Beach",
    "startCoords": [
      -33.8807,
      151.2034
    ],
    "destCoords": [
      -33.799,
      151.284
    ],
    "center": [
      -33.845,
      151.235
    ],
    "zoom": 12,
    "distance": "ca. 11 km Fähre",
    "driveTime": "ca. 20–30 Min. ÖPNV / Fähre",
    "transportType": "transit",
    "accommodation": "The Ultimo, Sydney",
    "stageRoute": [
      [
        -33.8807,
        151.2034
      ],
      [
        -33.859,
        151.2085
      ],
      [
        -33.8585,
        151.2185
      ],
      [
        -33.84,
        151.25
      ],
      [
        -33.799,
        151.284
      ]
    ],
    "activities": [
      "Sydney Opera House",
      "Mrs Macquarie’s Chair",
      "The Rocks & Harbour Bridge Pylon Walk",
      "Manly Ferry"
    ],
    "spotIds": [
      2,
      3
    ],
    "accommodationDetails": {
      "name": "The Ultimo, Sydney",
      "address": "50 Jones St, Ultimo NSW 2007 (Chinatown / Haymarket)",
      "location": "Sydney (NSW)",
      "checkIn": "Bereits eingecheckt",
      "checkOut": "bis 11:00 Uhr (am 25.03.)",
      "bookingUrl": "https://www.theultimo.com.au",
      "bookingLabel": "Hotel Website (The Ultimo)",
      "type": "hotel"
    },
    "plannedExpense": {
      "amount": 35,
      "label": "Manly Ferry & The Rocks Harbour Bridge Walk"
    },
    "spots": [
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
      }
    ]
  },
  {
    "day": 4,
    "date": "24.03. (Mi)",
    "title": "Sydney – Coastal Walk & Trendviertel",
    "location": "Sydney (NSW)",
    "start": "The Ultimo Sydney",
    "destination": "Bondi Beach & Surry Hills",
    "startCoords": [
      -33.8807,
      151.2034
    ],
    "destCoords": [
      -33.8915,
      151.2767
    ],
    "center": [
      -33.885,
      151.24
    ],
    "zoom": 13,
    "distance": "ca. 15 km ÖPNV / 6 km Walk",
    "driveTime": "ca. 25 Min. Bus",
    "transportType": "transit",
    "accommodation": "The Ultimo, Sydney",
    "stageRoute": [
      [
        -33.8807,
        151.2034
      ],
      [
        -33.886,
        151.2135
      ],
      [
        -33.888,
        151.25
      ],
      [
        -33.8915,
        151.2767
      ],
      [
        -33.92,
        151.258
      ]
    ],
    "activities": [
      "Bondi to Coogee Coastal Walk",
      "Bondi Icebergs Pool",
      "Surry Hills Cafékultur (Crown St)",
      "Paddington Boutiquen"
    ],
    "spotIds": [
      4,
      5
    ],
    "accommodationDetails": {
      "name": "The Ultimo, Sydney",
      "address": "50 Jones St, Ultimo NSW 2007 (Chinatown / Haymarket)",
      "location": "Sydney (NSW)",
      "checkIn": "Bereits eingecheckt",
      "checkOut": "Morgen bis 11:00 Uhr",
      "bookingUrl": "https://www.theultimo.com.au",
      "bookingLabel": "Hotel Website (The Ultimo)",
      "type": "hotel"
    },
    "plannedExpense": {
      "amount": 40,
      "label": "Bondi Coastal Walk Verpflegung & Cafés"
    },
    "spots": [
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
      }
    ]
  },
  {
    "day": 5,
    "date": "25.03. (Do)",
    "title": "Flug nach Ballina / Byron Bay",
    "location": "Sydney → Byron Bay / Ballina (NSW)",
    "start": "Sydney Kingsford Smith Airport (SYD)",
    "destination": "Cape Byron Lighthouse & East Ballina",
    "startCoords": [
      -33.9461,
      151.1772
    ],
    "destCoords": [
      -28.6384,
      153.6366
    ],
    "center": [
      -28.75,
      153.6
    ],
    "zoom": 10,
    "distance": "ca. 610 km Flug + 30 km Mietwagen",
    "driveTime": "ca. 1 Std. 15 Min. Flug + 25 Min. Fahrt",
    "transportType": "flight",
    "accommodation": "AirBnB, East Ballina (East Ballina, NSW)",
    "stageRoute": [
      [
        -33.9461,
        151.1772
      ],
      [
        -28.834,
        153.562
      ],
      [
        -28.865,
        153.585
      ],
      [
        -28.6384,
        153.6366
      ]
    ],
    "activities": [
      "Flug SYD → BNK",
      "Mietwagenübernahme Ballina",
      "Cape Byron Lighthouse (östlichster Festlandpunkt)"
    ],
    "spotIds": [
      6
    ],
    "accommodationDetails": {
      "name": "AirBnB East Ballina",
      "address": "East Ballina, NSW 2478",
      "location": "East Ballina / Byron Bay (NSW)",
      "checkIn": "ab 15:00 Uhr",
      "checkOut": "bis 10:00 Uhr (am 27.03.)",
      "bookingUrl": "https://www.airbnb.at/rooms/1065553106126009714",
      "bookingLabel": "AirBnB Buchung öffnen",
      "type": "airbnb"
    },
    "plannedExpense": {
      "amount": 205,
      "label": "Inlandsflug SYD → Ballina (125 €) + Mietwagen (80 €)"
    },
    "spots": [
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
      }
    ]
  },
  {
    "day": 6,
    "date": "26.03. (Fr)",
    "title": "Byron Bay & Erlebnisse am Ozean",
    "location": "Byron Bay (NSW)",
    "start": "AirBnB East Ballina",
    "destination": "Wategos Beach & The Pass (Byron Bay)",
    "startCoords": [
      -28.865,
      153.585
    ],
    "destCoords": [
      -28.636,
      153.628
    ],
    "center": [
      -28.64,
      153.625
    ],
    "zoom": 12,
    "distance": "ca. 30 km (je Richtung)",
    "driveTime": "ca. 25 Min. Fahrt",
    "transportType": "drive",
    "accommodation": "AirBnB, East Ballina",
    "stageRoute": [
      [
        -28.865,
        153.585
      ],
      [
        -28.7,
        153.59
      ],
      [
        -28.643,
        153.612
      ],
      [
        -28.636,
        153.628
      ]
    ],
    "activities": [
      "Kajaktour mit Delfinen & Schildkröten",
      "Wategos Beach & The Pass",
      "Beach Hotel Live-Musik"
    ],
    "spotIds": [
      7
    ],
    "accommodationDetails": {
      "name": "AirBnB East Ballina",
      "address": "East Ballina, NSW 2478",
      "location": "East Ballina / Byron Bay (NSW)",
      "checkIn": "Bereits eingecheckt",
      "checkOut": "Morgen bis 10:00 Uhr",
      "bookingUrl": "https://www.airbnb.at/rooms/1065553106126009714",
      "bookingLabel": "AirBnB Buchung öffnen",
      "type": "airbnb"
    },
    "plannedExpense": {
      "amount": 65,
      "label": "AirBnB East Ballina & Kajaktour"
    },
    "spots": [
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
      }
    ]
  },
  {
    "day": 7,
    "date": "27.03. (Sa)",
    "title": "Byron Bay → Gold Coast → Brisbane",
    "location": "Byron Bay → Gold Coast → Brisbane (NSW/QLD)",
    "start": "Byron Bay",
    "destination": "Hotel Rambla at Story House (Brisbane)",
    "startCoords": [
      -28.643,
      153.612
    ],
    "destCoords": [
      -27.485,
      153.033
    ],
    "center": [
      -28.05,
      153.3
    ],
    "zoom": 9,
    "distance": "ca. 175 km",
    "driveTime": "ca. 2,5 Std. Fahrtzeit",
    "transportType": "drive",
    "accommodation": "Rambla at Story House, Brisbane (Woolloongabba / Kangaroo Point)",
    "stageRoute": [
      [
        -28.643,
        153.612
      ],
      [
        -28.1667,
        153.5333
      ],
      [
        -28.0933,
        153.456
      ],
      [
        -27.9667,
        153.4
      ],
      [
        -27.485,
        153.033
      ],
      [
        -27.4608,
        153.036
      ]
    ],
    "activities": [
      "Burleigh Heads Lookout & Gold Coast Skyline",
      "Fahrt über den Pacific Motorway",
      "Howard Smith Wharves & Story Bridge"
    ],
    "spotIds": [
      8,
      9
    ],
    "accommodationDetails": {
      "name": "Rambla at Story House",
      "address": "Woolloongabba / Kangaroo Point, Brisbane QLD",
      "location": "Brisbane City (QLD)",
      "checkIn": "ab 14:00 Uhr",
      "checkOut": "bis 10:00 Uhr (am 30.03.)",
      "bookingUrl": "https://www.rambla.com.au/locations/story-house",
      "bookingLabel": "Rambla Hotel Website",
      "type": "hotel"
    },
    "plannedExpense": {
      "amount": 120,
      "label": "Hotel Brisbane (95 €) + Sprit Anteil (25 €)"
    },
    "spots": [
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
      }
    ]
  },
  {
    "day": 8,
    "date": "28.03. (So)",
    "title": "Brisbane – Kultur, Fluss & Aussicht",
    "location": "Brisbane (QLD)",
    "start": "Hotel Rambla (Woolloongabba)",
    "destination": "South Bank & Mt Coot-tha",
    "startCoords": [
      -27.485,
      153.033
    ],
    "destCoords": [
      -27.477,
      152.9535
    ],
    "center": [
      -27.475,
      152.99
    ],
    "zoom": 12,
    "distance": "ca. 18 km",
    "driveTime": "ca. 30 Min. CityCat / Fahrt",
    "transportType": "transit",
    "accommodation": "Rambla at Story House, Brisbane",
    "stageRoute": [
      [
        -27.485,
        153.033
      ],
      [
        -27.4785,
        153.0205
      ],
      [
        -27.47,
        153
      ],
      [
        -27.477,
        152.9535
      ]
    ],
    "activities": [
      "South Bank Parklands & Streets Beach",
      "CityCat Katamaranfahrt Brisbane River",
      "Mt Coot-tha Panoramablick"
    ],
    "spotIds": [
      10,
      11
    ],
    "accommodationDetails": {
      "name": "Rambla at Story House",
      "address": "Woolloongabba / Kangaroo Point, Brisbane QLD",
      "location": "Brisbane City (QLD)",
      "checkIn": "Bereits eingecheckt",
      "checkOut": "bis 10:00 Uhr (am 30.03.)",
      "bookingUrl": "https://www.rambla.com.au/locations/story-house",
      "bookingLabel": "Rambla Hotel Website",
      "type": "hotel"
    },
    "plannedExpense": {
      "amount": 25,
      "label": "Brisbane CityCat Katamaran & South Bank"
    },
    "spots": [
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
      }
    ]
  },
  {
    "day": 9,
    "date": "29.03. (Mo)",
    "title": "Brisbane – Riverwalk & Urban Lifestyle",
    "location": "Brisbane & Sunshine Coast Hinterland (QLD)",
    "start": "Brisbane City",
    "destination": "Australia Zoo (Beerwah)",
    "startCoords": [
      -27.4698,
      153.0251
    ],
    "destCoords": [
      -26.837,
      152.961
    ],
    "center": [
      -27.15,
      153
    ],
    "zoom": 10,
    "distance": "ca. 150 km (Hin- & Rückweg)",
    "driveTime": "ca. 1 Std. je Richtung",
    "transportType": "drive",
    "accommodation": "Rambla at Story House, Brisbane",
    "stageRoute": [
      [
        -27.4698,
        153.0251
      ],
      [
        -27.2,
        152.98
      ],
      [
        -26.837,
        152.961
      ]
    ],
    "activities": [
      "Australia Zoo (Home of the Crocodile Hunter)",
      "Kängurus füttern im Roo-Heaven",
      "Crocoseum Wildlife Warriors"
    ],
    "spotIds": [
      12
    ],
    "accommodationDetails": {
      "name": "Rambla at Story House",
      "address": "Woolloongabba / Kangaroo Point, Brisbane QLD",
      "location": "Brisbane City (QLD)",
      "checkIn": "Bereits eingecheckt",
      "checkOut": "Morgen bis 10:00 Uhr",
      "bookingUrl": "https://www.rambla.com.au/locations/story-house",
      "bookingLabel": "Rambla Hotel Website",
      "type": "hotel"
    },
    "plannedExpense": {
      "amount": 60,
      "label": "Australia Zoo Beerwah Ticket"
    },
    "spots": [
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
      }
    ]
  },
  {
    "day": 10,
    "date": "30.03. (Di)",
    "title": "Brisbane → Glass House Mountains → Noosa",
    "location": "Brisbane → Glass House Mountains → Noosa (QLD)",
    "start": "Brisbane City",
    "destination": "Villa Noosa Hotel / Bounce Noosa",
    "startCoords": [
      -27.4698,
      153.0251
    ],
    "destCoords": [
      -26.398,
      153.093
    ],
    "center": [
      -26.7,
      153.05
    ],
    "zoom": 9,
    "distance": "ca. 150 km",
    "driveTime": "ca. 2,5 Std. Panoramaroute",
    "transportType": "drive",
    "accommodation": "Villa Noosa Hotel / Bounce Noosa (Noosaville, QLD)",
    "stageRoute": [
      [
        -27.4698,
        153.0251
      ],
      [
        -26.9015,
        152.935
      ],
      [
        -26.65,
        153.0667
      ],
      [
        -26.398,
        153.093
      ],
      [
        -26.381,
        153.111
      ]
    ],
    "activities": [
      "Wanderung auf den Mt Ngungun (Glass House Mountains)",
      "Fairy Pools & Noosa Nationalpark Coastal Walk"
    ],
    "spotIds": [
      13,
      14
    ],
    "accommodationDetails": {
      "name": "Villa Noosa Hotel",
      "address": "19 Mary St, Noosaville QLD 4566",
      "location": "Noosa Heads / Noosaville (QLD)",
      "checkIn": "ab 14:00 Uhr",
      "checkOut": "Morgen bis 10:00 Uhr",
      "bookingUrl": "https://www.villanoosa.com.au",
      "bookingLabel": "Villa Noosa Website",
      "type": "hotel"
    },
    "plannedExpense": {
      "amount": 90,
      "label": "Villa Noosa Hotel & Nationalpark"
    },
    "spots": [
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
      }
    ]
  },
  {
    "day": 11,
    "date": "31.03. (Mi)",
    "title": "Noosa → Carlo Sand Blow → Hervey Bay",
    "location": "Noosa → Rainbow Beach → Hervey Bay (QLD)",
    "start": "Noosa Heads",
    "destination": "Hervey Bay (Nightcap at Kondari Resort)",
    "startCoords": [
      -26.398,
      153.093
    ],
    "destCoords": [
      -25.2986,
      152.8535
    ],
    "center": [
      -25.85,
      153
    ],
    "zoom": 9,
    "distance": "ca. 190 km",
    "driveTime": "ca. 2,5 Std. Fahrtzeit",
    "transportType": "drive",
    "accommodation": "Nightcap at Kondari Resort, Hervey Bay (Hervey Bay, QLD)",
    "stageRoute": [
      [
        -26.398,
        153.093
      ],
      [
        -25.908,
        153.0964
      ],
      [
        -25.55,
        152.7
      ],
      [
        -25.2986,
        152.8535
      ]
    ],
    "activities": [
      "Kängurus am Morgen in Noosa",
      "Carlo Sand Blow Riesendüne Rainbow Beach",
      "Fahrt nach Hervey Bay"
    ],
    "spotIds": [
      15
    ],
    "accommodationDetails": {
      "name": "Nightcap at Kondari Resort",
      "address": "49-63 Elizabeth St, Urangan QLD 4655",
      "location": "Hervey Bay (QLD)",
      "checkIn": "ab 14:00 Uhr",
      "checkOut": "Morgen bis 10:00 Uhr",
      "bookingUrl": "https://nightcap.nighteliercollective.com.au",
      "bookingLabel": "Kondari Resort Website",
      "type": "hotel"
    },
    "plannedExpense": {
      "amount": 95,
      "label": "Hervey Bay Kondari Resort & Rainbow Beach"
    },
    "spots": [
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
      }
    ]
  },
  {
    "day": 12,
    "date": "01.04. (Do)",
    "title": "K’gari (Fraser Island) & Nachtbus nach Norden",
    "location": "K’gari (Fraser Island) & Nachtbus (QLD)",
    "start": "Hervey Bay Fähranleger",
    "destination": "K’gari (Lake McKenzie & Maheno Wreck) → Nachtbus",
    "startCoords": [
      -25.2986,
      152.8535
    ],
    "destCoords": [
      -25.449,
      153.058
    ],
    "center": [
      -25.35,
      153
    ],
    "zoom": 9,
    "distance": "ca. 860 km Nachtbus-Transfer",
    "driveTime": "ca. 11 Std. Nachtbus (Hervey Bay → Airlie Beach)",
    "transportType": "transit",
    "accommodation": "Greyhound / Premier Nachtbus (Hervey Bay → Airlie Beach)",
    "stageRoute": [
      [
        -25.2986,
        152.8535
      ],
      [
        -25.449,
        153.058
      ],
      [
        -24.8,
        152.3
      ],
      [
        -23.35,
        150.5
      ],
      [
        -21.14,
        149.18
      ],
      [
        -20.2675,
        148.718
      ]
    ],
    "activities": [
      "4x4 Offroad-Tour K’gari",
      "Kristallklarer Lake McKenzie",
      "Schiffswrack SS Maheno",
      "Nachtbusfahrt gen Norden"
    ],
    "spotIds": [
      16
    ],
    "accommodationDetails": {
      "name": "Greyhound Australia Nachtbus",
      "address": "Fraser Coast (Hervey Bay) ➔ Airlie Beach",
      "location": "K’gari Fraser Island / Nachtbus",
      "checkIn": "Abfahrt 20:30 Uhr",
      "checkOut": "Ankunft ca. 08:30 Uhr (Tag 13)",
      "bookingUrl": "https://www.greyhound.com.au",
      "bookingLabel": "Greyhound Bus Ticket",
      "type": "bus"
    },
    "plannedExpense": {
      "amount": 235,
      "label": "K’gari 4x4 Offroad-Tour (180 €) + Nachtbus (55 €)"
    },
    "spots": [
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
      }
    ]
  },
  {
    "day": 13,
    "date": "02.04. (Fr)",
    "title": "Ankunft Airlie Beach & Whitsundays Helikopter-Rundflug",
    "location": "Airlie Beach & Whitsundays (QLD)",
    "start": "Airlie Beach Busstation / Coral Sea Marina",
    "destination": "Coral Sea Vista Apartments",
    "startCoords": [
      -20.2675,
      148.718
    ],
    "destCoords": [
      -20.272,
      148.714
    ],
    "center": [
      -20.268,
      148.718
    ],
    "zoom": 13,
    "distance": "ca. 15 km lokaler Radius",
    "driveTime": "ca. 20 Min. Shuttle",
    "transportType": "transit",
    "accommodation": "Coral Sea Vista Apartments, Airlie Beach (Airlie Beach, QLD)",
    "stageRoute": [
      [
        -20.2675,
        148.718
      ],
      [
        -20.272,
        148.714
      ]
    ],
    "activities": [
      "Ankunft Nachtbus",
      "Apartment Check-in & Strandlagune",
      "Helikopter-Rundflug Great Barrier Reef & Heart Reef"
    ],
    "spotIds": [
      17
    ],
    "accommodationDetails": {
      "name": "Coral Sea Vista Apartments",
      "address": "20 The Esplanade, Airlie Beach QLD 4802",
      "location": "Airlie Beach (QLD)",
      "checkIn": "ab 14:00 Uhr (Gepäckabgabe morgens)",
      "checkOut": "bis 10:00 Uhr (am 05.04.)",
      "bookingUrl": "https://www.booking.com/hotel/au/coral-sea-vista-apartments.de.html",
      "bookingLabel": "Booking.com Buchung",
      "type": "hotel"
    },
    "plannedExpense": {
      "amount": 330,
      "label": "Coral Sea Vista Whitsundays (110 €) + Heli-Rundflug (220 €)"
    },
    "spots": [
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
      }
    ]
  },
  {
    "day": 14,
    "date": "03.04. (Sa)",
    "title": "Whitsundays Highlight-Tag",
    "location": "Whitsunday Islands (QLD)",
    "start": "Coral Sea Marina (Airlie Beach)",
    "destination": "Hill Inlet Lookout & Whitehaven Beach",
    "startCoords": [
      -20.2675,
      148.718
    ],
    "destCoords": [
      -20.285,
      149.038
    ],
    "center": [
      -20.28,
      148.88
    ],
    "zoom": 11,
    "distance": "ca. 70 km Katamaran-Seeweg",
    "driveTime": "Ganztagestour Boot",
    "transportType": "boat",
    "accommodation": "Coral Sea Vista Apartments, Airlie Beach",
    "stageRoute": [
      [
        -20.2675,
        148.718
      ],
      [
        -20.15,
        148.85
      ],
      [
        -20.285,
        149.038
      ]
    ],
    "activities": [
      "Whitehaven Beach (98% reiner Quarzsand)",
      "Hill Inlet Lookout Sandmuster",
      "Schnorcheln am Korallenriff"
    ],
    "spotIds": [
      18
    ],
    "accommodationDetails": {
      "name": "Coral Sea Vista Apartments",
      "address": "20 The Esplanade, Airlie Beach QLD 4802",
      "location": "Airlie Beach (QLD)",
      "checkIn": "Bereits eingecheckt",
      "checkOut": "bis 10:00 Uhr (am 05.04.)",
      "bookingUrl": "https://www.booking.com/hotel/au/coral-sea-vista-apartments.de.html",
      "bookingLabel": "Booking.com Buchung",
      "type": "hotel"
    },
    "plannedExpense": {
      "amount": 145,
      "label": "Whitsundays Segeltour & Whitehaven Beach"
    },
    "spots": [
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
      }
    ]
  },
  {
    "day": 15,
    "date": "04.04. (So)",
    "title": "Airlie Beach & Umgebung (Cedar Creek Falls / Boardwalk)",
    "location": "Airlie Beach & Conway Nationalpark (QLD)",
    "start": "Airlie Beach",
    "destination": "Cedar Creek Falls (Conway Nationalpark)",
    "startCoords": [
      -20.2675,
      148.718
    ],
    "destCoords": [
      -20.407,
      148.694
    ],
    "center": [
      -20.34,
      148.705
    ],
    "zoom": 11,
    "distance": "ca. 60 km (Hin- & Rückweg)",
    "driveTime": "ca. 35 Min. je Richtung",
    "transportType": "drive",
    "accommodation": "Coral Sea Vista Apartments, Airlie Beach",
    "stageRoute": [
      [
        -20.2675,
        148.718
      ],
      [
        -20.34,
        148.68
      ],
      [
        -20.407,
        148.694
      ]
    ],
    "activities": [
      "Natur-Schwimmbecken Cedar Creek Falls",
      "Regenwald-Idylle Conway Nationalpark",
      "Bicentennial Walkway"
    ],
    "spotIds": [
      19
    ],
    "accommodationDetails": {
      "name": "Coral Sea Vista Apartments",
      "address": "20 The Esplanade, Airlie Beach QLD 4802",
      "location": "Airlie Beach (QLD)",
      "checkIn": "Bereits eingecheckt",
      "checkOut": "Morgen bis 10:00 Uhr",
      "bookingUrl": "https://www.booking.com/hotel/au/coral-sea-vista-apartments.de.html",
      "bookingLabel": "Booking.com Buchung",
      "type": "hotel"
    },
    "plannedExpense": {
      "amount": 50,
      "label": "Cedar Creek Falls & Entspannung Whitsundays"
    },
    "spots": [
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
      }
    ]
  },
  {
    "day": 16,
    "date": "05.04. (Mo)",
    "title": "Airlie Beach - Flug nach Melbourne",
    "location": "Airlie Beach → Melbourne (QLD/VIC)",
    "start": "Whitsunday Coast Airport (PPP)",
    "destination": "Vibe Hotel Docklands (Melbourne)",
    "startCoords": [
      -20.495,
      148.552
    ],
    "destCoords": [
      -37.816,
      144.938
    ],
    "center": [
      -37.818,
      144.95
    ],
    "zoom": 13,
    "distance": "ca. 1.950 km Flug + 22 km Transfer",
    "driveTime": "ca. 3 Std. Flug + 30 Min. Transfer",
    "transportType": "flight",
    "accommodation": "Vibe Hotel Docklands, Melbourne (Docklands, VIC)",
    "stageRoute": [
      [
        -20.495,
        148.552
      ],
      [
        -37.669,
        144.841
      ],
      [
        -37.816,
        144.938
      ],
      [
        -37.8205,
        144.964
      ]
    ],
    "activities": [
      "Flug PPP → MEL",
      "SkyBus Transfer ins CBD",
      "Southbank & Yarra River Abendspaziergang"
    ],
    "spotIds": [
      20
    ],
    "accommodationDetails": {
      "name": "Vibe Hotel Melbourne Docklands",
      "address": "44 Aquitania Way, Docklands VIC 3008",
      "location": "Melbourne Docklands (VIC)",
      "checkIn": "ab 14:00 Uhr",
      "checkOut": "bis 11:00 Uhr (am 09.04.)",
      "bookingUrl": "https://vibehotels.com",
      "bookingLabel": "Vibe Hotel Website",
      "type": "hotel"
    },
    "plannedExpense": {
      "amount": 235,
      "label": "Inlandsflug PPP → MEL (140 €) + Vibe Hotel (95 €)"
    },
    "spots": [
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
      }
    ]
  },
  {
    "day": 17,
    "date": "06.04. (Di)",
    "title": "Melbourne – Laneways, Street Art & Pinguine",
    "location": "Melbourne & St. Kilda (VIC)",
    "start": "Vibe Hotel Docklands",
    "destination": "Hosier Lane CBD & St. Kilda Pier",
    "startCoords": [
      -37.816,
      144.938
    ],
    "destCoords": [
      -37.8645,
      144.968
    ],
    "center": [
      -37.835,
      144.96
    ],
    "zoom": 12,
    "distance": "ca. 10 km",
    "driveTime": "ca. 25 Min. Tram / ÖPNV",
    "transportType": "transit",
    "accommodation": "Vibe Hotel Docklands, Melbourne",
    "stageRoute": [
      [
        -37.816,
        144.938
      ],
      [
        -37.8163,
        144.969
      ],
      [
        -37.835,
        144.975
      ],
      [
        -37.8645,
        144.968
      ]
    ],
    "activities": [
      "Melbourne Laneways & Street Art Hosier Lane",
      "Degraves Street Cafékultur",
      "Zwergpinguine bei Sonnenuntergang St. Kilda Pier"
    ],
    "spotIds": [
      21,
      22
    ],
    "accommodationDetails": {
      "name": "Vibe Hotel Melbourne Docklands",
      "address": "44 Aquitania Way, Docklands VIC 3008",
      "location": "Melbourne Docklands (VIC)",
      "checkIn": "Bereits eingecheckt",
      "checkOut": "bis 11:00 Uhr (am 09.04.)",
      "bookingUrl": "https://vibehotels.com",
      "bookingLabel": "Vibe Hotel Website",
      "type": "hotel"
    },
    "plannedExpense": {
      "amount": 125,
      "label": "Vibe Hotel Melbourne (95 €) + Cafés & Pinguine (30 €)"
    },
    "spots": [
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
      }
    ]
  },
  {
    "day": 18,
    "date": "07.04. (Mi)",
    "title": "Tagesausflug Great Ocean Road",
    "location": "Great Ocean Road (VIC)",
    "start": "Melbourne CBD",
    "destination": "Twelve Apostles & Loch Ard Gorge",
    "startCoords": [
      -37.8136,
      144.9631
    ],
    "destCoords": [
      -38.6655,
      143.104
    ],
    "center": [
      -38.5,
      143.7
    ],
    "zoom": 9,
    "distance": "ca. 480 km (Hin- & Rückweg)",
    "driveTime": "ca. 6 - 7 Std. Fahrtzeit",
    "transportType": "drive",
    "accommodation": "Vibe Hotel Docklands, Melbourne",
    "stageRoute": [
      [
        -37.8136,
        144.9631
      ],
      [
        -38.1499,
        144.3617
      ],
      [
        -38.3333,
        144.3167
      ],
      [
        -38.4333,
        144.1833
      ],
      [
        -38.541,
        143.975
      ],
      [
        -38.673,
        143.864
      ],
      [
        -38.758,
        143.669
      ],
      [
        -38.749,
        143.412
      ],
      [
        -38.6655,
        143.104
      ]
    ],
    "activities": [
      "Great Ocean Road Küstenstraße",
      "Wilde Koalas in den Eukalyptusbäumen Kennett River",
      "Twelve Apostles & Loch Ard Gorge"
    ],
    "spotIds": [
      23,
      24
    ],
    "accommodationDetails": {
      "name": "Vibe Hotel Melbourne Docklands",
      "address": "44 Aquitania Way, Docklands VIC 3008",
      "location": "Melbourne Docklands (VIC)",
      "checkIn": "Bereits eingecheckt",
      "checkOut": "bis 11:00 Uhr (am 09.04.)",
      "bookingUrl": "https://vibehotels.com",
      "bookingLabel": "Vibe Hotel Website",
      "type": "hotel"
    },
    "plannedExpense": {
      "amount": 70,
      "label": "Great Ocean Road Tagestour & Mietwagen Sprit"
    },
    "spots": [
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
      }
    ]
  },
  {
    "day": 19,
    "date": "08.04. (Do)",
    "title": "Melbourne – Brighton Boxes & Fitzroy / Ausklang",
    "location": "Melbourne (VIC)",
    "start": "Vibe Hotel Docklands",
    "destination": "Brighton Beach & Fitzroy",
    "startCoords": [
      -37.816,
      144.938
    ],
    "destCoords": [
      -37.7985,
      144.9785
    ],
    "center": [
      -37.84,
      144.97
    ],
    "zoom": 12,
    "distance": "ca. 30 km",
    "driveTime": "ca. 35 Min. Bahn / Tram",
    "transportType": "transit",
    "accommodation": "Vibe Hotel Docklands, Melbourne",
    "stageRoute": [
      [
        -37.816,
        144.938
      ],
      [
        -37.85,
        144.96
      ],
      [
        -37.9175,
        144.985
      ],
      [
        -37.81,
        144.97
      ],
      [
        -37.7985,
        144.9785
      ]
    ],
    "activities": [
      "Brighton Bathing Boxes (82 bunte Strandhäuser)",
      "Vintage & Street Life in Fitzroy",
      "Rooftop Bar Sunset Drink"
    ],
    "spotIds": [
      25,
      26
    ],
    "accommodationDetails": {
      "name": "Vibe Hotel Melbourne Docklands",
      "address": "44 Aquitania Way, Docklands VIC 3008",
      "location": "Melbourne Docklands (VIC)",
      "checkIn": "Bereits eingecheckt",
      "checkOut": "Morgen bis 11:00 Uhr",
      "bookingUrl": "https://vibehotels.com",
      "bookingLabel": "Vibe Hotel Website",
      "type": "hotel"
    },
    "plannedExpense": {
      "amount": 65,
      "label": "Melbourne Brighton Beach & Fitzroy Rooftop"
    },
    "spots": [
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
      }
    ]
  },
  {
    "day": 20,
    "date": "09.04. (Fr)",
    "title": "Rückflug nach Wien",
    "location": "Melbourne → Wien (Rückflug)",
    "start": "Royal Botanic Gardens Victoria",
    "destination": "Melbourne Tullamarine Airport (MEL) → Wien (VIE)",
    "startCoords": [
      -37.8304,
      144.98
    ],
    "destCoords": [
      -37.669,
      144.841
    ],
    "center": [
      -37.75,
      144.9
    ],
    "zoom": 11,
    "distance": "ca. 15.900 km Rückflug",
    "driveTime": "ca. 24 Std. Langstreckenflug",
    "transportType": "flight",
    "accommodation": "Langstreckenflug (Übernachtung an Bord / Flugzeug)",
    "stageRoute": [
      [
        -37.8304,
        144.98
      ],
      [
        -37.8136,
        144.9631
      ],
      [
        -37.669,
        144.841
      ]
    ],
    "activities": [
      "Spaziergang Royal Botanic Gardens Victoria",
      "SkyBus Transfer zum Airport MEL",
      "Rückflug nach Wien"
    ],
    "spotIds": [
      27
    ],
    "accommodationDetails": {
      "name": "Rückflug nach Wien (Scoot TR 25)",
      "address": "Melbourne Tullamarine Airport (MEL)",
      "location": "Flughafen / Rückflug",
      "checkIn": "Check-in ab 18:00 Uhr",
      "checkOut": "Landung in Wien (Tag 21)",
      "bookingUrl": "",
      "bookingLabel": "Flug TR 25 gebucht",
      "type": "flight"
    },
    "plannedExpense": {
      "amount": 45,
      "label": "Royal Botanic Gardens & Airport Transfer"
    },
    "spots": [
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
    ]
  }
];

  // 2. ABWÄRTSKOMPATIBLE TEILDATENSTRUKTUREN
  const TRIP_DAYS_DATA = [
  {
    "day": 1,
    "date": "21.03. (So)",
    "title": "Abreise aus Wien",
    "location": "Wien → Sydney (Langstreckenflug)",
    "start": "Flughafen Wien-Schwechat (VIE)",
    "destination": "Sydney Kingsford Smith Airport (SYD)",
    "startCoords": [
      48.1103,
      16.5697
    ],
    "destCoords": [
      -33.9461,
      151.1772
    ],
    "center": [
      -33.8688,
      151.2093
    ],
    "zoom": 6,
    "distance": "ca. 15.900 km",
    "driveTime": "ca. 22–24 Std. Flugzeit",
    "transportType": "flight",
    "accommodation": "Langstreckenflug (Übernachtung an Bord / Flugzeug)",
    "stageRoute": [
      [
        -33.9461,
        151.1772
      ],
      [
        -33.8688,
        151.2093
      ]
    ],
    "activities": [
      "Abreise aus Wien",
      "Langstreckenflug über Singapur (SIN)",
      "Zwischenstopp 3h 15m"
    ],
    "spotIds": []
  },
  {
    "day": 2,
    "date": "22.03. (Mo)",
    "title": "Ankunft in Sydney",
    "location": "Sydney (NSW)",
    "start": "Kingsford Smith Airport (SYD)",
    "destination": "The Ultimo Sydney (Chinatown / Haymarket)",
    "startCoords": [
      -33.9461,
      151.1772
    ],
    "destCoords": [
      -33.8807,
      151.2034
    ],
    "center": [
      -33.875,
      151.202
    ],
    "zoom": 13,
    "distance": "ca. 12 km",
    "driveTime": "ca. 25 Min. Transfer",
    "transportType": "drive",
    "accommodation": "The Ultimo, Sydney (50 Jones St, Ultimo NSW 2007)",
    "stageRoute": [
      [
        -33.9461,
        151.1772
      ],
      [
        -33.91,
        151.185
      ],
      [
        -33.8807,
        151.2034
      ],
      [
        -33.8695,
        151.201
      ]
    ],
    "activities": [
      "Landung 18:50 Uhr",
      "Flughafentransfer",
      "Hotel Check-in",
      "Abendessen Darling Harbour & Barangaroo"
    ],
    "spotIds": [
      1
    ]
  },
  {
    "day": 3,
    "date": "23.03. (Di)",
    "title": "Sydney – Klassiker am Hafen & Manly Ferry",
    "location": "Sydney (NSW)",
    "start": "The Ultimo Sydney",
    "destination": "Circular Quay & Manly Beach",
    "startCoords": [
      -33.8807,
      151.2034
    ],
    "destCoords": [
      -33.799,
      151.284
    ],
    "center": [
      -33.845,
      151.235
    ],
    "zoom": 12,
    "distance": "ca. 11 km Fähre",
    "driveTime": "ca. 20–30 Min. ÖPNV / Fähre",
    "transportType": "transit",
    "accommodation": "The Ultimo, Sydney",
    "stageRoute": [
      [
        -33.8807,
        151.2034
      ],
      [
        -33.859,
        151.2085
      ],
      [
        -33.8585,
        151.2185
      ],
      [
        -33.84,
        151.25
      ],
      [
        -33.799,
        151.284
      ]
    ],
    "activities": [
      "Sydney Opera House",
      "Mrs Macquarie’s Chair",
      "The Rocks & Harbour Bridge Pylon Walk",
      "Manly Ferry"
    ],
    "spotIds": [
      2,
      3
    ]
  },
  {
    "day": 4,
    "date": "24.03. (Mi)",
    "title": "Sydney – Coastal Walk & Trendviertel",
    "location": "Sydney (NSW)",
    "start": "The Ultimo Sydney",
    "destination": "Bondi Beach & Surry Hills",
    "startCoords": [
      -33.8807,
      151.2034
    ],
    "destCoords": [
      -33.8915,
      151.2767
    ],
    "center": [
      -33.885,
      151.24
    ],
    "zoom": 13,
    "distance": "ca. 15 km ÖPNV / 6 km Walk",
    "driveTime": "ca. 25 Min. Bus",
    "transportType": "transit",
    "accommodation": "The Ultimo, Sydney",
    "stageRoute": [
      [
        -33.8807,
        151.2034
      ],
      [
        -33.886,
        151.2135
      ],
      [
        -33.888,
        151.25
      ],
      [
        -33.8915,
        151.2767
      ],
      [
        -33.92,
        151.258
      ]
    ],
    "activities": [
      "Bondi to Coogee Coastal Walk",
      "Bondi Icebergs Pool",
      "Surry Hills Cafékultur (Crown St)",
      "Paddington Boutiquen"
    ],
    "spotIds": [
      4,
      5
    ]
  },
  {
    "day": 5,
    "date": "25.03. (Do)",
    "title": "Flug nach Ballina / Byron Bay",
    "location": "Sydney → Byron Bay / Ballina (NSW)",
    "start": "Sydney Kingsford Smith Airport (SYD)",
    "destination": "Cape Byron Lighthouse & East Ballina",
    "startCoords": [
      -33.9461,
      151.1772
    ],
    "destCoords": [
      -28.6384,
      153.6366
    ],
    "center": [
      -28.75,
      153.6
    ],
    "zoom": 10,
    "distance": "ca. 610 km Flug + 30 km Mietwagen",
    "driveTime": "ca. 1 Std. 15 Min. Flug + 25 Min. Fahrt",
    "transportType": "flight",
    "accommodation": "AirBnB, East Ballina (East Ballina, NSW)",
    "stageRoute": [
      [
        -33.9461,
        151.1772
      ],
      [
        -28.834,
        153.562
      ],
      [
        -28.865,
        153.585
      ],
      [
        -28.6384,
        153.6366
      ]
    ],
    "activities": [
      "Flug SYD → BNK",
      "Mietwagenübernahme Ballina",
      "Cape Byron Lighthouse (östlichster Festlandpunkt)"
    ],
    "spotIds": [
      6
    ]
  },
  {
    "day": 6,
    "date": "26.03. (Fr)",
    "title": "Byron Bay & Erlebnisse am Ozean",
    "location": "Byron Bay (NSW)",
    "start": "AirBnB East Ballina",
    "destination": "Wategos Beach & The Pass (Byron Bay)",
    "startCoords": [
      -28.865,
      153.585
    ],
    "destCoords": [
      -28.636,
      153.628
    ],
    "center": [
      -28.64,
      153.625
    ],
    "zoom": 12,
    "distance": "ca. 30 km (je Richtung)",
    "driveTime": "ca. 25 Min. Fahrt",
    "transportType": "drive",
    "accommodation": "AirBnB, East Ballina",
    "stageRoute": [
      [
        -28.865,
        153.585
      ],
      [
        -28.7,
        153.59
      ],
      [
        -28.643,
        153.612
      ],
      [
        -28.636,
        153.628
      ]
    ],
    "activities": [
      "Kajaktour mit Delfinen & Schildkröten",
      "Wategos Beach & The Pass",
      "Beach Hotel Live-Musik"
    ],
    "spotIds": [
      7
    ]
  },
  {
    "day": 7,
    "date": "27.03. (Sa)",
    "title": "Byron Bay → Gold Coast → Brisbane",
    "location": "Byron Bay → Gold Coast → Brisbane (NSW/QLD)",
    "start": "Byron Bay",
    "destination": "Hotel Rambla at Story House (Brisbane)",
    "startCoords": [
      -28.643,
      153.612
    ],
    "destCoords": [
      -27.485,
      153.033
    ],
    "center": [
      -28.05,
      153.3
    ],
    "zoom": 9,
    "distance": "ca. 175 km",
    "driveTime": "ca. 2,5 Std. Fahrtzeit",
    "transportType": "drive",
    "accommodation": "Rambla at Story House, Brisbane (Woolloongabba / Kangaroo Point)",
    "stageRoute": [
      [
        -28.643,
        153.612
      ],
      [
        -28.1667,
        153.5333
      ],
      [
        -28.0933,
        153.456
      ],
      [
        -27.9667,
        153.4
      ],
      [
        -27.485,
        153.033
      ],
      [
        -27.4608,
        153.036
      ]
    ],
    "activities": [
      "Burleigh Heads Lookout & Gold Coast Skyline",
      "Fahrt über den Pacific Motorway",
      "Howard Smith Wharves & Story Bridge"
    ],
    "spotIds": [
      8,
      9
    ]
  },
  {
    "day": 8,
    "date": "28.03. (So)",
    "title": "Brisbane – Kultur, Fluss & Aussicht",
    "location": "Brisbane (QLD)",
    "start": "Hotel Rambla (Woolloongabba)",
    "destination": "South Bank & Mt Coot-tha",
    "startCoords": [
      -27.485,
      153.033
    ],
    "destCoords": [
      -27.477,
      152.9535
    ],
    "center": [
      -27.475,
      152.99
    ],
    "zoom": 12,
    "distance": "ca. 18 km",
    "driveTime": "ca. 30 Min. CityCat / Fahrt",
    "transportType": "transit",
    "accommodation": "Rambla at Story House, Brisbane",
    "stageRoute": [
      [
        -27.485,
        153.033
      ],
      [
        -27.4785,
        153.0205
      ],
      [
        -27.47,
        153
      ],
      [
        -27.477,
        152.9535
      ]
    ],
    "activities": [
      "South Bank Parklands & Streets Beach",
      "CityCat Katamaranfahrt Brisbane River",
      "Mt Coot-tha Panoramablick"
    ],
    "spotIds": [
      10,
      11
    ]
  },
  {
    "day": 9,
    "date": "29.03. (Mo)",
    "title": "Brisbane – Riverwalk & Urban Lifestyle",
    "location": "Brisbane & Sunshine Coast Hinterland (QLD)",
    "start": "Brisbane City",
    "destination": "Australia Zoo (Beerwah)",
    "startCoords": [
      -27.4698,
      153.0251
    ],
    "destCoords": [
      -26.837,
      152.961
    ],
    "center": [
      -27.15,
      153
    ],
    "zoom": 10,
    "distance": "ca. 150 km (Hin- & Rückweg)",
    "driveTime": "ca. 1 Std. je Richtung",
    "transportType": "drive",
    "accommodation": "Rambla at Story House, Brisbane",
    "stageRoute": [
      [
        -27.4698,
        153.0251
      ],
      [
        -27.2,
        152.98
      ],
      [
        -26.837,
        152.961
      ]
    ],
    "activities": [
      "Australia Zoo (Home of the Crocodile Hunter)",
      "Kängurus füttern im Roo-Heaven",
      "Crocoseum Wildlife Warriors"
    ],
    "spotIds": [
      12
    ]
  },
  {
    "day": 10,
    "date": "30.03. (Di)",
    "title": "Brisbane → Glass House Mountains → Noosa",
    "location": "Brisbane → Glass House Mountains → Noosa (QLD)",
    "start": "Brisbane City",
    "destination": "Villa Noosa Hotel / Bounce Noosa",
    "startCoords": [
      -27.4698,
      153.0251
    ],
    "destCoords": [
      -26.398,
      153.093
    ],
    "center": [
      -26.7,
      153.05
    ],
    "zoom": 9,
    "distance": "ca. 150 km",
    "driveTime": "ca. 2,5 Std. Panoramaroute",
    "transportType": "drive",
    "accommodation": "Villa Noosa Hotel / Bounce Noosa (Noosaville, QLD)",
    "stageRoute": [
      [
        -27.4698,
        153.0251
      ],
      [
        -26.9015,
        152.935
      ],
      [
        -26.65,
        153.0667
      ],
      [
        -26.398,
        153.093
      ],
      [
        -26.381,
        153.111
      ]
    ],
    "activities": [
      "Wanderung auf den Mt Ngungun (Glass House Mountains)",
      "Fairy Pools & Noosa Nationalpark Coastal Walk"
    ],
    "spotIds": [
      13,
      14
    ]
  },
  {
    "day": 11,
    "date": "31.03. (Mi)",
    "title": "Noosa → Carlo Sand Blow → Hervey Bay",
    "location": "Noosa → Rainbow Beach → Hervey Bay (QLD)",
    "start": "Noosa Heads",
    "destination": "Hervey Bay (Nightcap at Kondari Resort)",
    "startCoords": [
      -26.398,
      153.093
    ],
    "destCoords": [
      -25.2986,
      152.8535
    ],
    "center": [
      -25.85,
      153
    ],
    "zoom": 9,
    "distance": "ca. 190 km",
    "driveTime": "ca. 2,5 Std. Fahrtzeit",
    "transportType": "drive",
    "accommodation": "Nightcap at Kondari Resort, Hervey Bay (Hervey Bay, QLD)",
    "stageRoute": [
      [
        -26.398,
        153.093
      ],
      [
        -25.908,
        153.0964
      ],
      [
        -25.55,
        152.7
      ],
      [
        -25.2986,
        152.8535
      ]
    ],
    "activities": [
      "Kängurus am Morgen in Noosa",
      "Carlo Sand Blow Riesendüne Rainbow Beach",
      "Fahrt nach Hervey Bay"
    ],
    "spotIds": [
      15
    ]
  },
  {
    "day": 12,
    "date": "01.04. (Do)",
    "title": "K’gari (Fraser Island) & Nachtbus nach Norden",
    "location": "K’gari (Fraser Island) & Nachtbus (QLD)",
    "start": "Hervey Bay Fähranleger",
    "destination": "K’gari (Lake McKenzie & Maheno Wreck) → Nachtbus",
    "startCoords": [
      -25.2986,
      152.8535
    ],
    "destCoords": [
      -25.449,
      153.058
    ],
    "center": [
      -25.35,
      153
    ],
    "zoom": 9,
    "distance": "ca. 860 km Nachtbus-Transfer",
    "driveTime": "ca. 11 Std. Nachtbus (Hervey Bay → Airlie Beach)",
    "transportType": "transit",
    "accommodation": "Greyhound / Premier Nachtbus (Hervey Bay → Airlie Beach)",
    "stageRoute": [
      [
        -25.2986,
        152.8535
      ],
      [
        -25.449,
        153.058
      ],
      [
        -24.8,
        152.3
      ],
      [
        -23.35,
        150.5
      ],
      [
        -21.14,
        149.18
      ],
      [
        -20.2675,
        148.718
      ]
    ],
    "activities": [
      "4x4 Offroad-Tour K’gari",
      "Kristallklarer Lake McKenzie",
      "Schiffswrack SS Maheno",
      "Nachtbusfahrt gen Norden"
    ],
    "spotIds": [
      16
    ]
  },
  {
    "day": 13,
    "date": "02.04. (Fr)",
    "title": "Ankunft Airlie Beach & Whitsundays Helikopter-Rundflug",
    "location": "Airlie Beach & Whitsundays (QLD)",
    "start": "Airlie Beach Busstation / Coral Sea Marina",
    "destination": "Coral Sea Vista Apartments",
    "startCoords": [
      -20.2675,
      148.718
    ],
    "destCoords": [
      -20.272,
      148.714
    ],
    "center": [
      -20.268,
      148.718
    ],
    "zoom": 13,
    "distance": "ca. 15 km lokaler Radius",
    "driveTime": "ca. 20 Min. Shuttle",
    "transportType": "transit",
    "accommodation": "Coral Sea Vista Apartments, Airlie Beach (Airlie Beach, QLD)",
    "stageRoute": [
      [
        -20.2675,
        148.718
      ],
      [
        -20.272,
        148.714
      ]
    ],
    "activities": [
      "Ankunft Nachtbus",
      "Apartment Check-in & Strandlagune",
      "Helikopter-Rundflug Great Barrier Reef & Heart Reef"
    ],
    "spotIds": [
      17
    ]
  },
  {
    "day": 14,
    "date": "03.04. (Sa)",
    "title": "Whitsundays Highlight-Tag",
    "location": "Whitsunday Islands (QLD)",
    "start": "Coral Sea Marina (Airlie Beach)",
    "destination": "Hill Inlet Lookout & Whitehaven Beach",
    "startCoords": [
      -20.2675,
      148.718
    ],
    "destCoords": [
      -20.285,
      149.038
    ],
    "center": [
      -20.28,
      148.88
    ],
    "zoom": 11,
    "distance": "ca. 70 km Katamaran-Seeweg",
    "driveTime": "Ganztagestour Boot",
    "transportType": "boat",
    "accommodation": "Coral Sea Vista Apartments, Airlie Beach",
    "stageRoute": [
      [
        -20.2675,
        148.718
      ],
      [
        -20.15,
        148.85
      ],
      [
        -20.285,
        149.038
      ]
    ],
    "activities": [
      "Whitehaven Beach (98% reiner Quarzsand)",
      "Hill Inlet Lookout Sandmuster",
      "Schnorcheln am Korallenriff"
    ],
    "spotIds": [
      18
    ]
  },
  {
    "day": 15,
    "date": "04.04. (So)",
    "title": "Airlie Beach & Umgebung (Cedar Creek Falls / Boardwalk)",
    "location": "Airlie Beach & Conway Nationalpark (QLD)",
    "start": "Airlie Beach",
    "destination": "Cedar Creek Falls (Conway Nationalpark)",
    "startCoords": [
      -20.2675,
      148.718
    ],
    "destCoords": [
      -20.407,
      148.694
    ],
    "center": [
      -20.34,
      148.705
    ],
    "zoom": 11,
    "distance": "ca. 60 km (Hin- & Rückweg)",
    "driveTime": "ca. 35 Min. je Richtung",
    "transportType": "drive",
    "accommodation": "Coral Sea Vista Apartments, Airlie Beach",
    "stageRoute": [
      [
        -20.2675,
        148.718
      ],
      [
        -20.34,
        148.68
      ],
      [
        -20.407,
        148.694
      ]
    ],
    "activities": [
      "Natur-Schwimmbecken Cedar Creek Falls",
      "Regenwald-Idylle Conway Nationalpark",
      "Bicentennial Walkway"
    ],
    "spotIds": [
      19
    ]
  },
  {
    "day": 16,
    "date": "05.04. (Mo)",
    "title": "Airlie Beach - Flug nach Melbourne",
    "location": "Airlie Beach → Melbourne (QLD/VIC)",
    "start": "Whitsunday Coast Airport (PPP)",
    "destination": "Vibe Hotel Docklands (Melbourne)",
    "startCoords": [
      -20.495,
      148.552
    ],
    "destCoords": [
      -37.816,
      144.938
    ],
    "center": [
      -37.818,
      144.95
    ],
    "zoom": 13,
    "distance": "ca. 1.950 km Flug + 22 km Transfer",
    "driveTime": "ca. 3 Std. Flug + 30 Min. Transfer",
    "transportType": "flight",
    "accommodation": "Vibe Hotel Docklands, Melbourne (Docklands, VIC)",
    "stageRoute": [
      [
        -20.495,
        148.552
      ],
      [
        -37.669,
        144.841
      ],
      [
        -37.816,
        144.938
      ],
      [
        -37.8205,
        144.964
      ]
    ],
    "activities": [
      "Flug PPP → MEL",
      "SkyBus Transfer ins CBD",
      "Southbank & Yarra River Abendspaziergang"
    ],
    "spotIds": [
      20
    ]
  },
  {
    "day": 17,
    "date": "06.04. (Di)",
    "title": "Melbourne – Laneways, Street Art & Pinguine",
    "location": "Melbourne & St. Kilda (VIC)",
    "start": "Vibe Hotel Docklands",
    "destination": "Hosier Lane CBD & St. Kilda Pier",
    "startCoords": [
      -37.816,
      144.938
    ],
    "destCoords": [
      -37.8645,
      144.968
    ],
    "center": [
      -37.835,
      144.96
    ],
    "zoom": 12,
    "distance": "ca. 10 km",
    "driveTime": "ca. 25 Min. Tram / ÖPNV",
    "transportType": "transit",
    "accommodation": "Vibe Hotel Docklands, Melbourne",
    "stageRoute": [
      [
        -37.816,
        144.938
      ],
      [
        -37.8163,
        144.969
      ],
      [
        -37.835,
        144.975
      ],
      [
        -37.8645,
        144.968
      ]
    ],
    "activities": [
      "Melbourne Laneways & Street Art Hosier Lane",
      "Degraves Street Cafékultur",
      "Zwergpinguine bei Sonnenuntergang St. Kilda Pier"
    ],
    "spotIds": [
      21,
      22
    ]
  },
  {
    "day": 18,
    "date": "07.04. (Mi)",
    "title": "Tagesausflug Great Ocean Road",
    "location": "Great Ocean Road (VIC)",
    "start": "Melbourne CBD",
    "destination": "Twelve Apostles & Loch Ard Gorge",
    "startCoords": [
      -37.8136,
      144.9631
    ],
    "destCoords": [
      -38.6655,
      143.104
    ],
    "center": [
      -38.5,
      143.7
    ],
    "zoom": 9,
    "distance": "ca. 480 km (Hin- & Rückweg)",
    "driveTime": "ca. 6 - 7 Std. Fahrtzeit",
    "transportType": "drive",
    "accommodation": "Vibe Hotel Docklands, Melbourne",
    "stageRoute": [
      [
        -37.8136,
        144.9631
      ],
      [
        -38.1499,
        144.3617
      ],
      [
        -38.3333,
        144.3167
      ],
      [
        -38.4333,
        144.1833
      ],
      [
        -38.541,
        143.975
      ],
      [
        -38.673,
        143.864
      ],
      [
        -38.758,
        143.669
      ],
      [
        -38.749,
        143.412
      ],
      [
        -38.6655,
        143.104
      ]
    ],
    "activities": [
      "Great Ocean Road Küstenstraße",
      "Wilde Koalas in den Eukalyptusbäumen Kennett River",
      "Twelve Apostles & Loch Ard Gorge"
    ],
    "spotIds": [
      23,
      24
    ]
  },
  {
    "day": 19,
    "date": "08.04. (Do)",
    "title": "Melbourne – Brighton Boxes & Fitzroy / Ausklang",
    "location": "Melbourne (VIC)",
    "start": "Vibe Hotel Docklands",
    "destination": "Brighton Beach & Fitzroy",
    "startCoords": [
      -37.816,
      144.938
    ],
    "destCoords": [
      -37.7985,
      144.9785
    ],
    "center": [
      -37.84,
      144.97
    ],
    "zoom": 12,
    "distance": "ca. 30 km",
    "driveTime": "ca. 35 Min. Bahn / Tram",
    "transportType": "transit",
    "accommodation": "Vibe Hotel Docklands, Melbourne",
    "stageRoute": [
      [
        -37.816,
        144.938
      ],
      [
        -37.85,
        144.96
      ],
      [
        -37.9175,
        144.985
      ],
      [
        -37.81,
        144.97
      ],
      [
        -37.7985,
        144.9785
      ]
    ],
    "activities": [
      "Brighton Bathing Boxes (82 bunte Strandhäuser)",
      "Vintage & Street Life in Fitzroy",
      "Rooftop Bar Sunset Drink"
    ],
    "spotIds": [
      25,
      26
    ]
  },
  {
    "day": 20,
    "date": "09.04. (Fr)",
    "title": "Rückflug nach Wien",
    "location": "Melbourne → Wien (Rückflug)",
    "start": "Royal Botanic Gardens Victoria",
    "destination": "Melbourne Tullamarine Airport (MEL) → Wien (VIE)",
    "startCoords": [
      -37.8304,
      144.98
    ],
    "destCoords": [
      -37.669,
      144.841
    ],
    "center": [
      -37.75,
      144.9
    ],
    "zoom": 11,
    "distance": "ca. 15.900 km Rückflug",
    "driveTime": "ca. 24 Std. Langstreckenflug",
    "transportType": "flight",
    "accommodation": "Langstreckenflug (Übernachtung an Bord / Flugzeug)",
    "stageRoute": [
      [
        -37.8304,
        144.98
      ],
      [
        -37.8136,
        144.9631
      ],
      [
        -37.669,
        144.841
      ]
    ],
    "activities": [
      "Spaziergang Royal Botanic Gardens Victoria",
      "SkyBus Transfer zum Airport MEL",
      "Rückflug nach Wien"
    ],
    "spotIds": [
      27
    ]
  }
];
  const TRIP_DAYS = tripData.map(d => ({ day: d.day, date: d.isoDate || ('2027-03-' + (20 + d.day).toString().padStart(2, '0')), title: d.title }));
  const ACCOMMODATION_DETAILS = {
  "1": {
    "name": "Langstreckenflug Scoot TR 12",
    "address": "Flughafen Wien (VIE) → Singapur (SIN) → Sydney (SYD)",
    "location": "Flugzeug / Transit",
    "checkIn": "Boarding 09:15 Uhr",
    "checkOut": "Landung 18:50 Uhr (Tag 2)",
    "bookingUrl": "",
    "bookingLabel": "Flug TR 12 gebucht",
    "type": "flight"
  },
  "2": {
    "name": "The Ultimo, Sydney",
    "address": "50 Jones St, Ultimo NSW 2007 (Chinatown / Haymarket)",
    "location": "Sydney (NSW)",
    "checkIn": "ab 14:00 Uhr",
    "checkOut": "bis 11:00 Uhr (am 25.03.)",
    "bookingUrl": "https://www.theultimo.com.au",
    "bookingLabel": "Hotel Website (The Ultimo)",
    "type": "hotel"
  },
  "3": {
    "name": "The Ultimo, Sydney",
    "address": "50 Jones St, Ultimo NSW 2007 (Chinatown / Haymarket)",
    "location": "Sydney (NSW)",
    "checkIn": "Bereits eingecheckt",
    "checkOut": "bis 11:00 Uhr (am 25.03.)",
    "bookingUrl": "https://www.theultimo.com.au",
    "bookingLabel": "Hotel Website (The Ultimo)",
    "type": "hotel"
  },
  "4": {
    "name": "The Ultimo, Sydney",
    "address": "50 Jones St, Ultimo NSW 2007 (Chinatown / Haymarket)",
    "location": "Sydney (NSW)",
    "checkIn": "Bereits eingecheckt",
    "checkOut": "Morgen bis 11:00 Uhr",
    "bookingUrl": "https://www.theultimo.com.au",
    "bookingLabel": "Hotel Website (The Ultimo)",
    "type": "hotel"
  },
  "5": {
    "name": "AirBnB East Ballina",
    "address": "East Ballina, NSW 2478",
    "location": "East Ballina / Byron Bay (NSW)",
    "checkIn": "ab 15:00 Uhr",
    "checkOut": "bis 10:00 Uhr (am 27.03.)",
    "bookingUrl": "https://www.airbnb.at/rooms/1065553106126009714",
    "bookingLabel": "AirBnB Buchung öffnen",
    "type": "airbnb"
  },
  "6": {
    "name": "AirBnB East Ballina",
    "address": "East Ballina, NSW 2478",
    "location": "East Ballina / Byron Bay (NSW)",
    "checkIn": "Bereits eingecheckt",
    "checkOut": "Morgen bis 10:00 Uhr",
    "bookingUrl": "https://www.airbnb.at/rooms/1065553106126009714",
    "bookingLabel": "AirBnB Buchung öffnen",
    "type": "airbnb"
  },
  "7": {
    "name": "Rambla at Story House",
    "address": "Woolloongabba / Kangaroo Point, Brisbane QLD",
    "location": "Brisbane City (QLD)",
    "checkIn": "ab 14:00 Uhr",
    "checkOut": "bis 10:00 Uhr (am 30.03.)",
    "bookingUrl": "https://www.rambla.com.au/locations/story-house",
    "bookingLabel": "Rambla Hotel Website",
    "type": "hotel"
  },
  "8": {
    "name": "Rambla at Story House",
    "address": "Woolloongabba / Kangaroo Point, Brisbane QLD",
    "location": "Brisbane City (QLD)",
    "checkIn": "Bereits eingecheckt",
    "checkOut": "bis 10:00 Uhr (am 30.03.)",
    "bookingUrl": "https://www.rambla.com.au/locations/story-house",
    "bookingLabel": "Rambla Hotel Website",
    "type": "hotel"
  },
  "9": {
    "name": "Rambla at Story House",
    "address": "Woolloongabba / Kangaroo Point, Brisbane QLD",
    "location": "Brisbane City (QLD)",
    "checkIn": "Bereits eingecheckt",
    "checkOut": "Morgen bis 10:00 Uhr",
    "bookingUrl": "https://www.rambla.com.au/locations/story-house",
    "bookingLabel": "Rambla Hotel Website",
    "type": "hotel"
  },
  "10": {
    "name": "Villa Noosa Hotel",
    "address": "19 Mary St, Noosaville QLD 4566",
    "location": "Noosa Heads / Noosaville (QLD)",
    "checkIn": "ab 14:00 Uhr",
    "checkOut": "Morgen bis 10:00 Uhr",
    "bookingUrl": "https://www.villanoosa.com.au",
    "bookingLabel": "Villa Noosa Website",
    "type": "hotel"
  },
  "11": {
    "name": "Nightcap at Kondari Resort",
    "address": "49-63 Elizabeth St, Urangan QLD 4655",
    "location": "Hervey Bay (QLD)",
    "checkIn": "ab 14:00 Uhr",
    "checkOut": "Morgen bis 10:00 Uhr",
    "bookingUrl": "https://nightcap.nighteliercollective.com.au",
    "bookingLabel": "Kondari Resort Website",
    "type": "hotel"
  },
  "12": {
    "name": "Greyhound Australia Nachtbus",
    "address": "Fraser Coast (Hervey Bay) ➔ Airlie Beach",
    "location": "K’gari Fraser Island / Nachtbus",
    "checkIn": "Abfahrt 20:30 Uhr",
    "checkOut": "Ankunft ca. 08:30 Uhr (Tag 13)",
    "bookingUrl": "https://www.greyhound.com.au",
    "bookingLabel": "Greyhound Bus Ticket",
    "type": "bus"
  },
  "13": {
    "name": "Coral Sea Vista Apartments",
    "address": "20 The Esplanade, Airlie Beach QLD 4802",
    "location": "Airlie Beach (QLD)",
    "checkIn": "ab 14:00 Uhr (Gepäckabgabe morgens)",
    "checkOut": "bis 10:00 Uhr (am 05.04.)",
    "bookingUrl": "https://www.booking.com/hotel/au/coral-sea-vista-apartments.de.html",
    "bookingLabel": "Booking.com Buchung",
    "type": "hotel"
  },
  "14": {
    "name": "Coral Sea Vista Apartments",
    "address": "20 The Esplanade, Airlie Beach QLD 4802",
    "location": "Airlie Beach (QLD)",
    "checkIn": "Bereits eingecheckt",
    "checkOut": "bis 10:00 Uhr (am 05.04.)",
    "bookingUrl": "https://www.booking.com/hotel/au/coral-sea-vista-apartments.de.html",
    "bookingLabel": "Booking.com Buchung",
    "type": "hotel"
  },
  "15": {
    "name": "Coral Sea Vista Apartments",
    "address": "20 The Esplanade, Airlie Beach QLD 4802",
    "location": "Airlie Beach (QLD)",
    "checkIn": "Bereits eingecheckt",
    "checkOut": "Morgen bis 10:00 Uhr",
    "bookingUrl": "https://www.booking.com/hotel/au/coral-sea-vista-apartments.de.html",
    "bookingLabel": "Booking.com Buchung",
    "type": "hotel"
  },
  "16": {
    "name": "Vibe Hotel Melbourne Docklands",
    "address": "44 Aquitania Way, Docklands VIC 3008",
    "location": "Melbourne Docklands (VIC)",
    "checkIn": "ab 14:00 Uhr",
    "checkOut": "bis 11:00 Uhr (am 09.04.)",
    "bookingUrl": "https://vibehotels.com",
    "bookingLabel": "Vibe Hotel Website",
    "type": "hotel"
  },
  "17": {
    "name": "Vibe Hotel Melbourne Docklands",
    "address": "44 Aquitania Way, Docklands VIC 3008",
    "location": "Melbourne Docklands (VIC)",
    "checkIn": "Bereits eingecheckt",
    "checkOut": "bis 11:00 Uhr (am 09.04.)",
    "bookingUrl": "https://vibehotels.com",
    "bookingLabel": "Vibe Hotel Website",
    "type": "hotel"
  },
  "18": {
    "name": "Vibe Hotel Melbourne Docklands",
    "address": "44 Aquitania Way, Docklands VIC 3008",
    "location": "Melbourne Docklands (VIC)",
    "checkIn": "Bereits eingecheckt",
    "checkOut": "bis 11:00 Uhr (am 09.04.)",
    "bookingUrl": "https://vibehotels.com",
    "bookingLabel": "Vibe Hotel Website",
    "type": "hotel"
  },
  "19": {
    "name": "Vibe Hotel Melbourne Docklands",
    "address": "44 Aquitania Way, Docklands VIC 3008",
    "location": "Melbourne Docklands (VIC)",
    "checkIn": "Bereits eingecheckt",
    "checkOut": "Morgen bis 11:00 Uhr",
    "bookingUrl": "https://vibehotels.com",
    "bookingLabel": "Vibe Hotel Website",
    "type": "hotel"
  },
  "20": {
    "name": "Rückflug nach Wien (Scoot TR 25)",
    "address": "Melbourne Tullamarine Airport (MEL)",
    "location": "Flughafen / Rückflug",
    "checkIn": "Check-in ab 18:00 Uhr",
    "checkOut": "Landung in Wien (Tag 21)",
    "bookingUrl": "",
    "bookingLabel": "Flug TR 25 gebucht",
    "type": "flight"
  }
};
  const DAY_PLANNED_EXPENSES = {
  "1": {
    "amount": 453,
    "label": "Langstreckenflug Wien → Sydney (gebucht)"
  },
  "2": {
    "amount": 150,
    "label": "The Ultimo Sydney Hotel & Transfer"
  },
  "3": {
    "amount": 35,
    "label": "Manly Ferry & The Rocks Harbour Bridge Walk"
  },
  "4": {
    "amount": 40,
    "label": "Bondi Coastal Walk Verpflegung & Cafés"
  },
  "5": {
    "amount": 205,
    "label": "Inlandsflug SYD → Ballina (125 €) + Mietwagen (80 €)"
  },
  "6": {
    "amount": 65,
    "label": "AirBnB East Ballina & Kajaktour"
  },
  "7": {
    "amount": 120,
    "label": "Hotel Brisbane (95 €) + Sprit Anteil (25 €)"
  },
  "8": {
    "amount": 25,
    "label": "Brisbane CityCat Katamaran & South Bank"
  },
  "9": {
    "amount": 60,
    "label": "Australia Zoo Beerwah Ticket"
  },
  "10": {
    "amount": 90,
    "label": "Villa Noosa Hotel & Nationalpark"
  },
  "11": {
    "amount": 95,
    "label": "Hervey Bay Kondari Resort & Rainbow Beach"
  },
  "12": {
    "amount": 235,
    "label": "K’gari 4x4 Offroad-Tour (180 €) + Nachtbus (55 €)"
  },
  "13": {
    "amount": 330,
    "label": "Coral Sea Vista Whitsundays (110 €) + Heli-Rundflug (220 €)"
  },
  "14": {
    "amount": 145,
    "label": "Whitsundays Segeltour & Whitehaven Beach"
  },
  "15": {
    "amount": 50,
    "label": "Cedar Creek Falls & Entspannung Whitsundays"
  },
  "16": {
    "amount": 235,
    "label": "Inlandsflug PPP → MEL (140 €) + Vibe Hotel (95 €)"
  },
  "17": {
    "amount": 125,
    "label": "Vibe Hotel Melbourne (95 €) + Cafés & Pinguine (30 €)"
  },
  "18": {
    "amount": 70,
    "label": "Great Ocean Road Tagestour & Mietwagen Sprit"
  },
  "19": {
    "amount": 65,
    "label": "Melbourne Brighton Beach & Fitzroy Rooftop"
  },
  "20": {
    "amount": 45,
    "label": "Royal Botanic Gardens & Airport Transfer"
  }
};
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
    'Donnerstag, 1. April 2027',
    'Freitag, 2. April 2027',
    'Samstag, 3. April 2027',
    'Sonntag, 4. April 2027',
    'Montag, 5. April 2027',
    'Dienstag, 6. April 2027',
    'Mittwoch, 7. April 2027',
    'Donnerstag, 8. April 2027',
    'Freitag, 9. April 2027'
  ];

  // 3. BUDGET & FINANZEN
  const BUDGET_CATEGORIES_CONFIG = {
  "flights": {
    "id": "flights",
    "label": "Flüge",
    "plannedEurP": 1093,
    "color": "#006d68",
    "icon": "fa-plane"
  },
  "hotels": {
    "id": "hotels",
    "label": "Unterkunft",
    "plannedEurP": 648.5,
    "color": "#d96b27",
    "icon": "fa-hotel"
  },
  "car": {
    "id": "car",
    "label": "Mietwagen",
    "plannedEurP": 245,
    "color": "#0284c7",
    "icon": "fa-car"
  },
  "fuel": {
    "id": "fuel",
    "label": "Benzin",
    "plannedEurP": 120,
    "color": "#eab308",
    "icon": "fa-gas-pump"
  },
  "food": {
    "id": "food",
    "label": "Essen & Drinks",
    "plannedEurP": 350,
    "color": "#10b981",
    "icon": "fa-utensils"
  },
  "activities": {
    "id": "activities",
    "label": "Aktivitäten",
    "plannedEurP": 603,
    "color": "#8b5cf6",
    "icon": "fa-ticket"
  },
  "groceries": {
    "id": "groceries",
    "label": "Einkäufe",
    "plannedEurP": 180,
    "color": "#ec4899",
    "icon": "fa-cart-shopping"
  },
  "misc": {
    "id": "misc",
    "label": "Sonstiges",
    "plannedEurP": 168.5,
    "color": "#64748b",
    "icon": "fa-box-archive"
  }
};
  const DEFAULT_EXPENSES_LIST = [
  {
    "id": "exp-1",
    "title": "Flug Wien → Sydney (Scoot TR 12)",
    "date": "2027-03-21",
    "dayNum": 1,
    "category": "flights",
    "amountEur": 1812,
    "amountAud": 2918,
    "currency": "EUR",
    "payer": "Gruppe",
    "note": "Langstreckenflug für alle 4 Personen gebucht & bezahlt"
  },
  {
    "id": "exp-2",
    "title": "Flug Sydney → Ballina / Byron Bay (Virgin VA 1141)",
    "date": "2027-03-25",
    "dayNum": 5,
    "category": "flights",
    "amountEur": 216,
    "amountAud": 348,
    "currency": "EUR",
    "payer": "Gruppe",
    "note": "Inlandsflug für 4 Personen gebucht & bezahlt"
  },
  {
    "id": "exp-3",
    "title": "Flug Proserpine → Melbourne (Jetstar JQ 843)",
    "date": "2027-04-05",
    "dayNum": 16,
    "category": "flights",
    "amountEur": 540,
    "amountAud": 870,
    "currency": "EUR",
    "payer": "Gruppe",
    "note": "Inlandsflug für 4 Personen gebucht & bezahlt"
  },
  {
    "id": "exp-4",
    "title": "Rückflug Melbourne → Wien (Scoot TR 25)",
    "date": "2027-04-09",
    "dayNum": 20,
    "category": "flights",
    "amountEur": 1804,
    "amountAud": 2905,
    "currency": "EUR",
    "payer": "Gruppe",
    "note": "Rückflug für 4 Personen gebucht & bezahlt"
  }
];

  // 4. ORGANISATION, BUCHUNGEN & PACKLISTE
  const DEFAULT_BOOKINGS_LIST = [
  {
    "id": "bkg-f1",
    "category": "flights",
    "name": "Langstreckenflug Scoot TR 12 (Wien ➔ Sydney via SIN)",
    "provider": "Scoot Airlines",
    "bookingRef": "TR12-VIE-SYD",
    "date": "2027-03-21",
    "time": "09:15",
    "location": "Flughafen Wien-Schwechat (VIE) Terminal 3",
    "cost": 1812,
    "currency": "EUR",
    "link": "https://www.flyscoot.com",
    "notes": "Langstreckenflug für 4 Personen gebucht & bezahlt (453 € p.P.). Boarding 08:30 Uhr.",
    "dayNum": 1,
    "status": "confirmed"
  },
  {
    "id": "bkg-h1",
    "category": "hotels",
    "name": "The Ultimo, Sydney (Chinatown / Haymarket)",
    "provider": "The Ultimo",
    "bookingRef": "ULT-849201",
    "date": "2027-03-22",
    "time": "14:00",
    "location": "50 Jones St, Ultimo NSW 2007",
    "cost": 476,
    "currency": "EUR",
    "link": "https://www.theultimo.com.au",
    "notes": "3 Nächte (22.03. - 25.03.). Check-in ab 14:00 Uhr, Check-out bis 11:00 Uhr. 119 € p.P.",
    "dayNum": 2,
    "status": "confirmed"
  },
  {
    "id": "bkg-f2",
    "category": "flights",
    "name": "Inlandsflug Virgin Australia VA 1141 (Sydney ➔ Ballina)",
    "provider": "Virgin Australia",
    "bookingRef": "VA1141-SYD-BNK",
    "date": "2027-03-25",
    "time": "08:30",
    "location": "Sydney Domestic Airport (SYD) Terminal 2",
    "cost": 216,
    "currency": "EUR",
    "link": "https://www.virginaustralia.com",
    "notes": "Inlandsflug für 4 Personen (54 € p.P.). Gepäck 23kg p.P. inkludiert.",
    "dayNum": 5,
    "status": "confirmed"
  },
  {
    "id": "bkg-c1",
    "category": "car",
    "name": "Mietwagen SUV East Coast (Ballina ➔ Hervey Bay / Brisbane)",
    "provider": "Hertz / Avis Car Rental",
    "bookingRef": "HZ-AU-938210",
    "date": "2027-03-25",
    "time": "10:15",
    "location": "Ballina Byron Gateway Airport (BNK)",
    "cost": 620,
    "currency": "EUR",
    "link": "https://www.hertz.com.au",
    "notes": "Mietdauer Tage 5–11 (7 Tage). SUV/Van für 4 Personen + Gepäck. Vollkasko ohne SB.",
    "dayNum": 5,
    "status": "confirmed"
  },
  {
    "id": "bkg-h2",
    "category": "hotels",
    "name": "AirBnB East Ballina (Byron Bay Region)",
    "provider": "Airbnb",
    "bookingRef": "HM9284KLM",
    "date": "2027-03-25",
    "time": "15:00",
    "location": "East Ballina, NSW 2478",
    "cost": 300,
    "currency": "EUR",
    "link": "https://www.airbnb.at/rooms/1065553106126009714",
    "notes": "2 Nächte (25.03. - 27.03.). Check-in per Schlüsselbox ab 15:00 Uhr. 75 € p.P.",
    "dayNum": 5,
    "status": "confirmed"
  },
  {
    "id": "bkg-h3",
    "category": "hotels",
    "name": "Rambla at Story House (Brisbane)",
    "provider": "Rambla Hotels",
    "bookingRef": "RAM-391024",
    "date": "2027-03-27",
    "time": "14:00",
    "location": "Woolloongabba / Kangaroo Point, Brisbane QLD",
    "cost": 476,
    "currency": "EUR",
    "link": "https://www.rambla.com.au/locations/story-house",
    "notes": "3 Nächte (27.03. - 30.03.). Check-in ab 14:00 Uhr, Check-out bis 10:00 Uhr. 119 € p.P.",
    "dayNum": 7,
    "status": "confirmed"
  },
  {
    "id": "bkg-h4",
    "category": "hotels",
    "name": "Villa Noosa Hotel (Noosaville)",
    "provider": "Villa Noosa",
    "bookingRef": "VN-58291",
    "date": "2027-03-30",
    "time": "14:00",
    "location": "19 Mary St, Noosaville QLD 4566",
    "cost": 134,
    "currency": "EUR",
    "link": "https://www.villanoosa.com.au",
    "notes": "1 Nacht (30.03. - 31.03.). Check-in ab 14:00 Uhr. 33.50 € p.P.",
    "dayNum": 10,
    "status": "confirmed"
  },
  {
    "id": "bkg-cp1",
    "category": "camping",
    "name": "Nationalpark & Camping Permit Noosa Everglades",
    "provider": "Queensland Parks & Wildlife (QPWS)",
    "bookingRef": "QPWS-2027-8841",
    "date": "2027-03-30",
    "time": "09:00",
    "location": "Cooloola Recreation Area, Great Sandy NP",
    "cost": 60,
    "currency": "EUR",
    "link": "https://parks.desi.qld.gov.au",
    "notes": "Vehicle Access Permit & Camping Permit für Everglades / Cooloola Sandbahn.",
    "dayNum": 10,
    "status": "confirmed"
  },
  {
    "id": "bkg-h5",
    "category": "hotels",
    "name": "Nightcap at Kondari Resort (Hervey Bay)",
    "provider": "Nightcap Hotels",
    "bookingRef": "NC-71249",
    "date": "2027-03-31",
    "time": "14:00",
    "location": "49-63 Elizabeth St, Urangan QLD 4655",
    "cost": 169,
    "currency": "EUR",
    "link": "https://nightcap.nighteliercollective.com.au",
    "notes": "1 Nacht vor K’gari Tour (31.03. - 01.04.). Check-in ab 14:00 Uhr. 42.25 € p.P.",
    "dayNum": 11,
    "status": "confirmed"
  },
  {
    "id": "bkg-t1",
    "category": "activities",
    "name": "K’gari Fraser Island 1-Day 4WD Explorer Tour",
    "provider": "K’gari Explorer Tours",
    "bookingRef": "KG-4WD-10294",
    "date": "2027-04-01",
    "time": "07:30",
    "location": "Urangan Marina / Abholung Resort, Hervey Bay QLD",
    "cost": 756,
    "currency": "EUR",
    "link": "https://www.kgariexplorertours.com.au",
    "notes": "Ganztagestour für 4 Personen (189 € p.P.). Inkl. Fähre, Lake McKenzie, 75 Mile Beach, Eli Creek & Lunch.",
    "dayNum": 12,
    "status": "confirmed"
  },
  {
    "id": "bkg-m1",
    "category": "misc",
    "name": "Greyhound Australia Nachtbus (Hervey Bay ➔ Airlie Beach)",
    "provider": "Greyhound Australia",
    "bookingRef": "GH-AU-847291",
    "date": "2027-04-01",
    "time": "20:30",
    "location": "Hervey Bay Transit Centre QLD",
    "cost": 360,
    "currency": "EUR",
    "link": "https://www.greyhound.com.au",
    "notes": "Abfahrt 20:30 Uhr, Ankunft Airlie Beach ca. 08:30 Uhr (Tag 13). 4x Reclining Sleeper Seats (90 € p.P.).",
    "dayNum": 12,
    "status": "confirmed"
  },
  {
    "id": "bkg-h6",
    "category": "hotels",
    "name": "Coral Sea Vista Apartments (Airlie Beach)",
    "provider": "Coral Sea Vista",
    "bookingRef": "BKG-CS-99120",
    "date": "2027-04-02",
    "time": "14:00",
    "location": "20 The Esplanade, Airlie Beach QLD 4802",
    "cost": 468,
    "currency": "EUR",
    "link": "https://www.booking.com/hotel/au/coral-sea-vista-apartments.de.html",
    "notes": "3 Nächte (02.04. - 05.04.). Frühe Gepäckabgabe morgens nach Busankunft vereinbart. 117 € p.P.",
    "dayNum": 13,
    "status": "confirmed"
  },
  {
    "id": "bkg-t2",
    "category": "activities",
    "name": "Whitsundays Katamaran Segeltour & Whitehaven Beach",
    "provider": "Camira Sailing / Cruise Whitsundays",
    "bookingRef": "WH-CAM-7721",
    "date": "2027-04-03",
    "time": "08:00",
    "location": "Coral Sea Marina, Airlie Beach QLD",
    "cost": 600,
    "currency": "EUR",
    "link": "https://cruisewhitsundays.com",
    "notes": "Ganztägiger Segeltörn auf Katamaran Camira für 4 Personen (150 € p.P.). Inkl. Schnorcheln & BBQ.",
    "dayNum": 14,
    "status": "confirmed"
  },
  {
    "id": "bkg-t3",
    "category": "activities",
    "name": "Whitsundays Helikopter Rundflug Heart Reef",
    "provider": "GSL Aviation",
    "bookingRef": "GSL-HELI-3382",
    "date": "2027-04-04",
    "time": "10:30",
    "location": "Whitsunday Airport, Shute Harbour QLD",
    "cost": 856,
    "currency": "EUR",
    "link": "https://www.gslaviation.com.au",
    "notes": "60 Minuten Helikopter Rundflug über Great Barrier Reef & Heart Reef (214 € p.P.).",
    "dayNum": 15,
    "status": "confirmed"
  },
  {
    "id": "bkg-f3",
    "category": "flights",
    "name": "Inlandsflug Jetstar JQ 843 (Proserpine ➔ Melbourne)",
    "provider": "Jetstar Airways",
    "bookingRef": "JQ843-PPP-MEL",
    "date": "2027-04-05",
    "time": "12:45",
    "location": "Whitsunday Coast Airport (PPP), Proserpine QLD",
    "cost": 540,
    "currency": "EUR",
    "link": "https://www.jetstar.com",
    "notes": "Direktflug nach Melbourne Tullamarine (135 € p.P. für 4 Personen). 20kg Aufgabegepäck.",
    "dayNum": 16,
    "status": "confirmed"
  },
  {
    "id": "bkg-h7",
    "category": "hotels",
    "name": "Vibe Hotel Melbourne Docklands",
    "provider": "Vibe Hotels",
    "bookingRef": "VIB-MEL-40291",
    "date": "2027-04-05",
    "time": "14:00",
    "location": "44 Aquitania Way, Docklands VIC 3008",
    "cost": 643,
    "currency": "EUR",
    "link": "https://vibehotels.com",
    "notes": "4 Nächte (05.04. - 09.04.). Check-in ab 14:00 Uhr, Check-out bis 11:00 Uhr. 160.75 € p.P.",
    "dayNum": 16,
    "status": "confirmed"
  },
  {
    "id": "bkg-c2",
    "category": "car",
    "name": "Mietwagen Great Ocean Road (Melbourne City / Southern Cross)",
    "provider": "Europcar Melbourne",
    "bookingRef": "EP-MEL-551920",
    "date": "2027-04-06",
    "time": "08:00",
    "location": "Southern Cross Station, Melbourne VIC",
    "cost": 200,
    "currency": "EUR",
    "link": "https://www.europcar.com.au",
    "notes": "2 Tage Roadtrip Great Ocean Road (Tage 17–18). Rückgabe City Station Tag 18 abends.",
    "dayNum": 17,
    "status": "confirmed"
  },
  {
    "id": "bkg-f4",
    "category": "flights",
    "name": "Rückflug Scoot TR 25 (Melbourne ➔ Wien via SIN)",
    "provider": "Scoot Airlines",
    "bookingRef": "TR25-MEL-VIE",
    "date": "2027-04-09",
    "time": "21:30",
    "location": "Melbourne Airport (MEL) Tullamarine Terminal 2",
    "cost": 1804,
    "currency": "EUR",
    "link": "https://www.flyscoot.com",
    "notes": "Rückflug für 4 Personen (451 € p.P.). Ankunft in Wien an Tag 21.",
    "dayNum": 20,
    "status": "confirmed"
  }
];
  const DEFAULT_PACKING_ITEMS = [
  {
    "id": "pack-doc-1",
    "category": "docs",
    "name": "Reisepass (mind. 6 Monate über Reisedatum gültig)",
    "quantity": "4x",
    "note": "Original & Farbkopienset. Digitale Kopie im Notfall-Tresor!",
    "packed": false,
    "link": "#emergency",
    "linkLabel": "Notfall-Tresor"
  },
  {
    "id": "pack-doc-2",
    "category": "docs",
    "name": "Australisches Visum (eVisitor Subclass 651)",
    "quantity": "4x",
    "note": "Online erteilt & an Reisepass gekoppelt. PDFs im Notfall-Vault.",
    "packed": false,
    "link": "#emergency",
    "linkLabel": "Notfall-Vault"
  },
  {
    "id": "pack-doc-3",
    "category": "docs",
    "name": "Internationaler Führerschein (Klasse B)",
    "quantity": "mind. 2 Fahrer",
    "note": "Nur in Kombination mit nationalem EU-Führerschein in Australien gültig!",
    "packed": false,
    "link": "#emergency",
    "linkLabel": "Dokumente"
  },
  {
    "id": "pack-doc-4",
    "category": "docs",
    "name": "Nationaler EU-Kartenführerschein",
    "quantity": "mind. 2 Fahrer",
    "note": "Unbedingt im Original mitführen für Mietwagenübernahme.",
    "packed": false,
    "link": "#emergency",
    "linkLabel": "Notfall-Vault"
  },
  {
    "id": "pack-doc-5",
    "category": "docs",
    "name": "Kreditkarten (DKB / Visa / Mastercard ohne Fremdwährungsgebühr)",
    "quantity": "2-3 Karten",
    "note": "Auf mind. 2 Personen verteilen. PINs auswendig merken.",
    "packed": false,
    "link": "#budget",
    "linkLabel": "Reisekasse"
  },
  {
    "id": "pack-doc-6",
    "category": "docs",
    "name": "Auslandskrankenversicherung Police & 24h-Notrufnummer",
    "quantity": "1x",
    "note": "Mit Rückholversicherung und Übernahme für Tauch-/Wassersportunfälle.",
    "packed": false,
    "link": "#emergency",
    "linkLabel": "Notfall-Tresor"
  },
  {
    "id": "pack-doc-7",
    "category": "docs",
    "name": "Buchungsbestätigungen & Voucher (Flüge, Hotels, Mietwagen, Touren)",
    "quantity": "Alle Belege",
    "note": "Alle Buchungen zentral in der Website hinterlegt & offline abrufbar.",
    "packed": false,
    "link": "#organization",
    "linkLabel": "Buchungsmanager"
  },
  {
    "id": "pack-tech-1",
    "category": "tech",
    "name": "Australien Reiseadapter (Steckdosen-Typ I, 3-polig gewinkelt)",
    "quantity": "2-3x",
    "note": "Typ-I Adapter für australische Steckdosen (230V, 50Hz).",
    "packed": false
  },
  {
    "id": "pack-tech-2",
    "category": "tech",
    "name": "Powerbank (20.000 mAh, flugzeugkonform max. 100 Wh)",
    "quantity": "2x",
    "note": "WICHTIG: Nur im Handgepäck transportieren, verboten im Aufgabegepäck!",
    "packed": false
  },
  {
    "id": "pack-tech-3",
    "category": "tech",
    "name": "USB-C & Lightning Schnellladekabel + Mehrfach-USB-Ladegerät",
    "quantity": "Set",
    "note": "65W GaN Multi-Port Charger für gleichzeitiges Laden mehrerer Handys.",
    "packed": false
  },
  {
    "id": "pack-tech-4",
    "category": "tech",
    "name": "Smartphone mit eSIM / Aussie-SIM-Ready",
    "quantity": "4x",
    "note": "Telstra/Boost Mobile Netz für beste Outback- & Coastal-Abdeckung.",
    "packed": false
  },
  {
    "id": "pack-tech-5",
    "category": "tech",
    "name": "Noise-Cancelling Kopfhörer (für 24h Langstreckenflug)",
    "quantity": "4x",
    "note": "Inkl. Flugzeug-Klinkenadapter (Doppelklinke 3.5mm).",
    "packed": false
  },
  {
    "id": "pack-tech-6",
    "category": "tech",
    "name": "Robuste Schutzhüllen / Wasserdichte Handyhülle (Lanyard)",
    "quantity": "2x",
    "note": "Für Schnorcheltouren Whitsundays, K’gari & Noosa Everglades.",
    "packed": false
  },
  {
    "id": "pack-cam-1",
    "category": "camera",
    "name": "Systemkamera / DSLR mit Weitwinkel- & Teleobjektiv",
    "quantity": "1x",
    "note": "Weitwinkel für Küstenlandschaften & Tele (70-200mm) für Kängurus & Wale.",
    "packed": false
  },
  {
    "id": "pack-cam-2",
    "category": "camera",
    "name": "Kamera-Ersatzakkus (mind. 2-3 Stück)",
    "quantity": "3x",
    "note": "Nur im Handgepäck transportieren wegen IATA Lithium-Vorschriften.",
    "packed": false
  },
  {
    "id": "pack-cam-3",
    "category": "camera",
    "name": "Schnelle SD-Karten (UHS-II / V60, mind. 128-256 GB)",
    "quantity": "4x",
    "note": "Inkl. robuster wasser- und staubdichter Speicherkarten-Aufbewahrungsbox.",
    "packed": false
  },
  {
    "id": "pack-cam-4",
    "category": "camera",
    "name": "Zirkular-Polfilter (CPL) & ND-Filter (Neutraldichte)",
    "quantity": "2x",
    "note": "Essentiell für tiefblaues Meerwasser, Reflexionsreduktion & weiche Wellen.",
    "packed": false
  },
  {
    "id": "pack-cam-5",
    "category": "camera",
    "name": "Kompaktes Reisestativ / GorillaPod",
    "quantity": "1x",
    "note": "Für Milchstraßen-Astrofotografie im Outback & Sonnenuntergangszeitraffer.",
    "packed": false
  },
  {
    "id": "pack-cam-6",
    "category": "camera",
    "name": "Objektiv-Reinigungsset & Blasebalg (Rocket Blower)",
    "quantity": "1x",
    "note": "Feiner Sand auf Fraser Island & Whitehaven Beach erfordert Staubschutz!",
    "packed": false
  },
  {
    "id": "pack-drn-1",
    "category": "drone",
    "name": "Drohne (DJI Mini / unter 249g)",
    "quantity": "1x",
    "note": "CASA Drohnenregeln beachten: Max. 120m, 30m Abstand zu Menschen, Sichtlinie!",
    "packed": false,
    "link": "#drone-hub",
    "linkLabel": "Drohnen-Hub"
  },
  {
    "id": "pack-drn-2",
    "category": "drone",
    "name": "Drohnen-Akkus (Fly More Combo, 3x Intelligent Flight Batteries)",
    "quantity": "3x",
    "note": "WICHTIG: Ausschließlich im Handgepäck in LiPo-Sicherheitstasche!",
    "packed": false,
    "link": "#drone-hub",
    "linkLabel": "CASA Regeln"
  },
  {
    "id": "pack-drn-3",
    "category": "drone",
    "name": "Drohnen-ND-Filterset (ND8, ND16, ND32, ND64 / PL)",
    "quantity": "Set",
    "note": "Unverzichtbar bei starker australischer Mittagssonne für flüssige 180°-Shutter-Videos.",
    "packed": false,
    "link": "#drone-hub",
    "linkLabel": "Filter-Guide"
  },
  {
    "id": "pack-drn-4",
    "category": "drone",
    "name": "Ersatzpropeller, Schraubendreher & faltbares Landepad",
    "quantity": "1x",
    "note": "Landepad schützt Motoren vor feinstem Quarzsand (Whitehaven / 75 Mile Beach).",
    "packed": false,
    "link": "#drone-hub",
    "linkLabel": "Drohnen-Zonen"
  },
  {
    "id": "pack-cloth-1",
    "category": "clothing",
    "name": "Atmungsaktive T-Shirts / Funktionsshirts",
    "quantity": "6-8x",
    "note": "Schnelltrocknend, Merinowolle oder Mikrofaser ideal für Warm- und Übergangsklima.",
    "packed": false
  },
  {
    "id": "pack-cloth-2",
    "category": "clothing",
    "name": "Leichte Shorts & Badeshorts / Bikinis",
    "quantity": "3-4x",
    "note": "Für Strände in Byron Bay, Noosa & Whitsundays.",
    "packed": false
  },
  {
    "id": "pack-cloth-3",
    "category": "clothing",
    "name": "Lange bequeme Hosen (Leinen / Zip-Off Wanderhose)",
    "quantity": "2-3x",
    "note": "Schutz vor Moskitos in der Dämmerung und für kühle Abende in Melbourne.",
    "packed": false
  },
  {
    "id": "pack-cloth-4",
    "category": "clothing",
    "name": "Fleecejacke / Leichter Pullover & Windbreaker",
    "quantity": "1-2x",
    "note": "Melbourne und Great Ocean Road können im April windig und frisch (14–18°C) sein.",
    "packed": false
  },
  {
    "id": "pack-cloth-5",
    "category": "clothing",
    "name": "Leichte Regenjacke / Hardshell (wasserdicht)",
    "quantity": "1x",
    "note": "Für tropische Schauer in Queensland & windiges Wetter an der Küste.",
    "packed": false
  },
  {
    "id": "pack-cloth-6",
    "category": "clothing",
    "name": "Feste Wanderschuhe / Trekkingsneaker mit Profilsohle",
    "quantity": "1 Paar",
    "note": "Eingelaufen! Für Blue Mountains, Noosa National Park & K’gari Trails.",
    "packed": false
  },
  {
    "id": "pack-cloth-7",
    "category": "clothing",
    "name": "Flip-Flops / Sandalen (Thongs)",
    "quantity": "1 Paar",
    "note": "Aussie-Standard für Strand, Hostel & Campingduschen.",
    "packed": false
  },
  {
    "id": "pack-cloth-8",
    "category": "clothing",
    "name": "UV-Schutzhut / Cap & Sonnenbrille mit UV400 / Polarisierung",
    "quantity": "1x",
    "note": "UV-Index in Australien extrem hoch. Polarisierte Brille schützt & zeigt Riffdetails.",
    "packed": false
  },
  {
    "id": "pack-hyg-1",
    "category": "hygiene",
    "name": "Rifffreundliche Sonnencreme (LSF 50+ Broad Spectrum)",
    "quantity": "2 Tuben",
    "note": "Ohne Oxybenzon & Octinoxat zum Schutz des Great Barrier Reefs.",
    "packed": false
  },
  {
    "id": "pack-hyg-2",
    "category": "hygiene",
    "name": "Tropisches Mückenspray (Bushman / DEET 40% oder Picaridin)",
    "quantity": "1-2x",
    "note": "Schutz vor Sandfliegen (Midges) und Moskitos an Mangroven & K’gari.",
    "packed": false
  },
  {
    "id": "pack-hyg-3",
    "category": "hygiene",
    "name": "Kulturbeutel mit Haken & Reisegrößen (Shampoo, Duschgel)",
    "quantity": "1x",
    "note": "Praktisch zum Aufhängen in Campingplätzen und Hotelbädern.",
    "packed": false
  },
  {
    "id": "pack-hyg-4",
    "category": "hygiene",
    "name": "Schnelltrocknendes Mikrofaser-Badetuch (groß)",
    "quantity": "1-2x",
    "note": "Leicht, platzsparend und trocknet in 30 Minuten in der Sonne.",
    "packed": false
  },
  {
    "id": "pack-hyg-5",
    "category": "hygiene",
    "name": "After-Sun Lotion / Reines Aloe Vera Gel",
    "quantity": "1x",
    "note": "Zur Beruhigung der Haut nach langen Sonnentagen am Pazifik.",
    "packed": false
  },
  {
    "id": "pack-hyg-6",
    "category": "hygiene",
    "name": "Zahnpflege, biologisch abbaubare Feuchttücher & Desinfektionsgel",
    "quantity": "Set",
    "note": "Unverzichtbar für Roadtrip-Stopps ohne fließendes Wasser.",
    "packed": false
  },
  {
    "id": "pack-med-1",
    "category": "meds",
    "name": "Erste-Hilfe-Set (Pflaster, Blasenpflaster, sterile Kompressen, Tape)",
    "quantity": "1 Set",
    "note": "Inkl. Pinzette für Splitter und Notfall-Wundschnellverband.",
    "packed": false,
    "link": "#emergency",
    "linkLabel": "Notfall-Infos"
  },
  {
    "id": "pack-med-2",
    "category": "meds",
    "name": "Schmerzmittel & Entzündungshemmer (Ibuprofen / Paracetamol)",
    "quantity": "2 Packungen",
    "note": "Gegen Kopfschmerzen, Muskelkater und Fieber.",
    "packed": false
  },
  {
    "id": "pack-med-3",
    "category": "meds",
    "name": "Magen-Darm-Medikamente (Imodium, Elektrolyte, Kohletabletten)",
    "quantity": "1 Set",
    "note": "Schnelle Hilfe bei Reisedurchfall und Dehydration in der Hitze.",
    "packed": false
  },
  {
    "id": "pack-med-4",
    "category": "meds",
    "name": "Reisekrankheits-Tabletten / Kaugummis (Travel Sickness)",
    "quantity": "1 Pckg.",
    "note": "Sehr wichtig für die Katamaran-Tour Whitsundays und Greyhound Nachtbus!",
    "packed": false
  },
  {
    "id": "pack-med-5",
    "category": "meds",
    "name": "Antihistaminikum / Fenistil Gel (Insektenstiche & Allergien)",
    "quantity": "1 Tube",
    "note": "Lindert sofort Juckreiz bei Sandfliegenbissen und Quallenkontakt.",
    "packed": false
  },
  {
    "id": "pack-med-6",
    "category": "meds",
    "name": "Persönliche Dauermedikation mit englischem Arztattest",
    "quantity": "Bedarf",
    "note": "Im Originalbehälter mitführen für australische Zoll- und Quarantänekontrolle.",
    "packed": false,
    "link": "#emergency",
    "linkLabel": "Notfall-Vault"
  },
  {
    "id": "pack-car-1",
    "category": "car",
    "name": "KFZ-Smartphone-Halterung (Lüftungsgitter / Saugnapf)",
    "quantity": "1x",
    "note": "Australische Verkehrsstrafe für Handy in der Hand am Steuer extrem hoch (>1.000 AUD)!",
    "packed": false
  },
  {
    "id": "pack-car-2",
    "category": "car",
    "name": "12V KFZ-Schnellladegerät (Dual USB-C PD)",
    "quantity": "1x",
    "note": "Hält Navigation und Akkus während stundenlanger Überlandfahrten geladen.",
    "packed": false
  },
  {
    "id": "pack-car-3",
    "category": "car",
    "name": "Offline-Karten (Google Maps / Maps.me) vorab heruntergeladen",
    "quantity": "Offline",
    "note": "Zwischen Ballina und Airlie Beach oft kilometerweit kein Mobilfunkempfang.",
    "packed": false
  },
  {
    "id": "pack-car-4",
    "category": "car",
    "name": "AUX-Kabel / Bluetooth FM-Transmitter & Sonnenblende",
    "quantity": "1x",
    "note": "Für unsere Spotify Roadtrip-Playlist und Blendschutz bei Linksfahr-Sonnenaufgang.",
    "packed": false,
    "link": "#playlist",
    "linkLabel": "Playlist"
  },
  {
    "id": "pack-cmp-1",
    "category": "camping",
    "name": "Wasserdichter Packsack / Dry Bag (10-20 Liter)",
    "quantity": "2x",
    "note": "Schützt Kameras und Handys bei Schlauchboot- & Katamarantouren vor Salzwasser.",
    "packed": false
  },
  {
    "id": "pack-cmp-2",
    "category": "camping",
    "name": "Stirnlampe / Taschenlampe mit Rotlichtfunktion",
    "quantity": "2x",
    "note": "Für Nachtwanderungen, K’gari Camping & schonende Tierbeobachtung im Dunkeln.",
    "packed": false
  },
  {
    "id": "pack-cmp-3",
    "category": "camping",
    "name": "Wiederverwendbare isolierte Edelstahl-Trinkflasche (1L)",
    "quantity": "4x",
    "note": "Hält Wasser eiskalt. Kostenlose Trinkwasserstationen fast überall in Australien.",
    "packed": false
  },
  {
    "id": "pack-cmp-4",
    "category": "camping",
    "name": "Eigenes Schnorchel-Set (Maske & Schnorchel)",
    "quantity": "Persönlich",
    "note": "Passt perfekt, bequemer und hygienischer als Leihmasken vor Ort.",
    "packed": false
  },
  {
    "id": "pack-misc-1",
    "category": "misc",
    "name": "Nackenhörnchen / Reisekissen & Schlafmaske + Ohrenstöpsel",
    "quantity": "4x",
    "note": "Goldwert für den 24h Flug nach Sydney und die 12h Nachtbusfahrt nach Airlie Beach.",
    "packed": false
  },
  {
    "id": "pack-misc-2",
    "category": "misc",
    "name": "Kompressions-Packwürfel (Packing Cubes)",
    "quantity": "1 Set",
    "note": "Spart 40% Kofferplatz und hält Ordnung im Mietwagen-Kofferraum.",
    "packed": false
  },
  {
    "id": "pack-misc-3",
    "category": "misc",
    "name": "Gepäckwaage (digital) & TSA-Kofferschlösser",
    "quantity": "1x",
    "note": "Vermeidet teures Übergewicht bei Scoot & Jetstar Inlandsflügen (max 20kg).",
    "packed": false
  },
  {
    "id": "pack-misc-4",
    "category": "misc",
    "name": "Faltbarer Tagesrucksack (15-20L) für Ausflüge",
    "quantity": "2x",
    "note": "Ultraleicht, passt zusammengefaltet in jede Hosentasche.",
    "packed": false
  }
];
  const PACKING_CATEGORIES = [
  {
    "key": "docs",
    "label": "Dokumente",
    "icon": "fa-passport"
  },
  {
    "key": "tech",
    "label": "Technik",
    "icon": "fa-plug"
  },
  {
    "key": "camera",
    "label": "Kamera",
    "icon": "fa-camera"
  },
  {
    "key": "drone",
    "label": "Drohne",
    "icon": "fa-paper-plane"
  },
  {
    "key": "clothing",
    "label": "Kleidung",
    "icon": "fa-shirt"
  },
  {
    "key": "hygiene",
    "label": "Hygiene",
    "icon": "fa-pump-soap"
  },
  {
    "key": "meds",
    "label": "Medikamente",
    "icon": "fa-kit-medical"
  },
  {
    "key": "car",
    "label": "Auto & Roadtrip",
    "icon": "fa-car-side"
  },
  {
    "key": "camping",
    "label": "Camping & Strand",
    "icon": "fa-umbrella-beach"
  },
  {
    "key": "misc",
    "label": "Sonstiges",
    "icon": "fa-suitcase"
  }
];
  const ORG_CATEGORY_META = {
  "flights": {
    "label": "Flüge",
    "icon": "fa-plane-departure",
    "color": "cat-flights"
  },
  "hotels": {
    "label": "Unterkünfte",
    "icon": "fa-hotel",
    "color": "cat-hotels"
  },
  "car": {
    "label": "Mietwagen",
    "icon": "fa-car",
    "color": "cat-car"
  },
  "activities": {
    "label": "Aktivitäten",
    "icon": "fa-person-hiking",
    "color": "cat-activities"
  },
  "camping": {
    "label": "Camping",
    "icon": "fa-campground",
    "color": "cat-camping"
  },
  "misc": {
    "label": "Sonstiges",
    "icon": "fa-ticket",
    "color": "cat-misc"
  }
};

  // 5. ERLEBNISSE, JOURNAL & FOTOS
  const DEFAULT_JOURNAL_ENTRIES = {
  "1": {
    "day": 1,
    "title": "Abreise aus Wien – Der Traum von Australien beginnt!",
    "mood": "🤩 Begeistert",
    "text": "Nach Monaten der Vorfreude und des Packens ging es heute am Flughafen Wien-Schwechat los. Unser Langstreckenflug mit Scoot (TR 12) startete im modernen Boeing 787 Dreamliner. Der Zwischenstopp in Singapur war spektakulär – der Riesen-Indoor-Wasserfall im Jewel Changi Airport ist live noch beeindruckender als auf Fotos! Jetzt sind wir auf der letzten Etappe nach Sydney.",
    "highlights": [
      "Pünktlicher Abflug aus Wien",
      "Jewel Changi Wasserfall im Transit",
      "Vorfreude auf Down Under"
    ],
    "specialExp": "Flo hat im Transit fast das Boarding-Gate verwechselt, aber wir haben es mit viel Lachen noch rechtzeitig geschafft.",
    "notes": "Kompressionsstrümpfe und Powerbank im Handgepäck waren Gold wert.",
    "links": "https://www.singaporeair.com",
    "photoUrls": [
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1000&auto=format&fit=crop&q=80"
    ],
    "updatedAt": "2027-03-21T18:00:00Z"
  },
  "2": {
    "day": 2,
    "title": "Touchdown in Sydney & erstes kühles Bier am Darling Harbour",
    "mood": "🤠 Abenteuerlustig",
    "text": "Um 18:50 Uhr australischer Zeit endlich auf australischem Boden aufgesetzt! Die Einreise mit dem eVisitor 651 ging überraschend schnell durch die SmartGates. Kurzer Transfer zum Ultimo Hotel in Chinatown – super Lage! Nach dem Einchecken sind wir direkt zu Fuß an den Darling Harbour geschlendert. Erste warme Frühlingsbrise, beleuchtete Skyline und das erste lokale Bier: Unglaublich, wir sind wirklich in Australien!",
    "highlights": [
      "Reibungslose SmartGate-Einreise",
      "Check-in The Ultimo",
      "Erster Abendspaziergang am Darling Harbour"
    ],
    "specialExp": "Der erste Moment am Hafen mit Blick auf die Skyline – echte Gänsehaut.",
    "notes": "Kreditkarte kontaktlos an den Drehkreuzen der Bahn funktioniert absolut reibungslos (keine extra Opal Card nötig).",
    "links": "https://www.theultimo.com.au",
    "photoUrls": [
      "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1000&auto=format&fit=crop&q=80"
    ],
    "updatedAt": "2027-03-22T21:30:00Z"
  }
};
  const DEFAULT_PHOTOS_LIST = [
  {
    "id": "photo-1",
    "dayNum": 2,
    "title": "Sydney Opera House & Harbour Bridge",
    "location": "Sydney Harbour, NSW",
    "url": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&auto=format&fit=crop&q=80",
    "caption": "Erster Blick auf die weltberühmte Oper im Abendlicht. Die Skyline spiegelt sich magisch im Hafenwasser.",
    "date": "2027-03-22"
  },
  {
    "id": "photo-2",
    "dayNum": 3,
    "title": "Manly Beach & Ocean Surf",
    "location": "Manly, Sydney NSW",
    "url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80",
    "caption": "Fahrt mit der Manly Ferry über den Hafen und die ersten echten Surfer am Pazifikstrand.",
    "date": "2027-03-23"
  },
  {
    "id": "photo-3",
    "dayNum": 4,
    "title": "Bondi to Coogee Coastal Walk",
    "location": "Bondi Beach, NSW",
    "url": "https://images.unsplash.com/photo-1517824806704-9040b037703b?w=1200&auto=format&fit=crop&q=80",
    "caption": "Spektakuläre Sandsteinklippen, azurblaues Meer und der berühmte Bondi Icebergs Ocean Pool.",
    "date": "2027-03-24"
  },
  {
    "id": "photo-4",
    "dayNum": 6,
    "title": "Cape Byron Lighthouse am östlichsten Punkt",
    "location": "Byron Bay, NSW",
    "url": "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1200&auto=format&fit=crop&q=80",
    "caption": "Sonnenaufgang am östlichsten Punkt des australischen Festlands. Delfine direkt vor der Küste!",
    "date": "2027-03-26"
  },
  {
    "id": "photo-5",
    "dayNum": 8,
    "title": "Brisbane South Bank & Streets Beach",
    "location": "Brisbane, QLD",
    "url": "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=1200&auto=format&fit=crop&q=80",
    "caption": "Mitten in der Großstadt ein tropischer Sandstrand mit Blick auf die Skyline – typisch Queensland.",
    "date": "2027-03-28"
  },
  {
    "id": "photo-6",
    "dayNum": 10,
    "title": "Noosa National Park Coastal Track",
    "location": "Noosa Heads, Sunshine Coast QLD",
    "url": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&auto=format&fit=crop&q=80",
    "caption": "Wanderung durch Eukalyptuswälder entlang türkisfarbener Buchten. Erster wilder Koala in den Baumkronen entdeckt!",
    "date": "2027-03-30"
  },
  {
    "id": "photo-7",
    "dayNum": 12,
    "title": "Lake McKenzie – K’gari (Fraser Island)",
    "location": "K’gari (Fraser Island), QLD",
    "url": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&auto=format&fit=crop&q=80",
    "caption": "Kristallklarer Süßwassersee aus reinem Regenwasser, umgeben von schneeweißem Quarzsand.",
    "date": "2027-04-01"
  },
  {
    "id": "photo-8",
    "dayNum": 14,
    "title": "Whitehaven Beach & Hill Inlet Whitsundays",
    "location": "Whitsunday Islands, Great Barrier Reef QLD",
    "url": "https://images.unsplash.com/photo-1589330273594-fade1ee91647?w=1200&auto=format&fit=crop&q=80",
    "caption": "Das wirbelnde Sandmuster von Hill Inlet vom Katamaran Camira aus. Einer der schönsten Strände der Welt.",
    "date": "2027-04-03"
  },
  {
    "id": "photo-9",
    "dayNum": 17,
    "title": "Melbourne Laneways & Hosier Lane Street Art",
    "location": "Melbourne CBD, VIC",
    "url": "https://images.unsplash.com/photo-1514395462725-fb4566210144?w=1200&auto=format&fit=crop&q=80",
    "caption": "Lebendige Kaffeekultur und weltberühmte Murals in den verwinkelten Gassen Melbournes.",
    "date": "2027-04-06"
  },
  {
    "id": "photo-10",
    "dayNum": 18,
    "title": "Twelve Apostles – Great Ocean Road",
    "location": "Port Campbell National Park, VIC",
    "url": "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&auto=format&fit=crop&q=80",
    "caption": "Gewaltige Kalksteinsäulen im tosenden Südpolarmeer bei Sonnenuntergang. Der krönende Roadtrip-Abschluss.",
    "date": "2027-04-07"
  }
];

  // 6. ROUTEN & GEODATEN
  const roadtripRoutes = [
  [
    [
      -28.643,
      153.612
    ],
    [
      -28.1667,
      153.5333
    ],
    [
      -28.0933,
      153.456
    ],
    [
      -27.9667,
      153.4
    ],
    [
      -27.4698,
      153.0251
    ],
    [
      -26.837,
      152.961
    ],
    [
      -26.9015,
      152.935
    ],
    [
      -26.65,
      153.0667
    ],
    [
      -26.398,
      153.093
    ],
    [
      -25.908,
      153.0964
    ],
    [
      -25.2986,
      152.8535
    ]
  ],
  [
    [
      -20.2675,
      148.718
    ],
    [
      -20.407,
      148.694
    ]
  ],
  [
    [
      -37.8136,
      144.9631
    ],
    [
      -38.1499,
      144.3617
    ],
    [
      -38.3333,
      144.3167
    ],
    [
      -38.4333,
      144.1833
    ],
    [
      -38.541,
      143.975
    ],
    [
      -38.673,
      143.864
    ],
    [
      -38.758,
      143.669
    ],
    [
      -38.749,
      143.412
    ],
    [
      -38.6655,
      143.104
    ],
    [
      -38.646,
      143.045
    ]
  ]
];
  const flightRoutes = [
  [
    [
      -33.9461,
      151.1772
    ],
    [
      -28.834,
      153.562
    ]
  ],
  [
    [
      -20.495,
      148.552
    ],
    [
      -37.669,
      144.841
    ]
  ]
];
  const regionNames = {
  "sydney": "Sydney & NSW",
  "byron": "Byron Bay & Gold Coast",
  "brisbane": "Brisbane & Sunshine Coast",
  "islands": "K’gari & Whitsundays",
  "melbourne": "Melbourne & Ocean Road"
};

  // 7. DROHNE & LUFTRAUM
  const airspaceFeatures = [
  {
    "type": "circle",
    "coords": [
      -33.9461,
      151.1772
    ],
    "radius": 5500,
    "color": "#ef4444",
    "fillColor": "#ef4444",
    "fillOpacity": 0.28,
    "title": "Sydney Kingsford Smith Airport (SYD)",
    "badge": "red",
    "badgeText": "Strikte No-Fly Zone (5,5 km)",
    "desc": "Kontrollierter Großflughafen. Absolutes Drohnenflugverbot im 5,5-km-Radius ohne Flugsicherungs-Freigabe!"
  },
  {
    "type": "circle",
    "coords": [
      -28.8333,
      153.5619
    ],
    "radius": 5500,
    "color": "#ef4444",
    "fillColor": "#ef4444",
    "fillOpacity": 0.28,
    "title": "Ballina Byron Gateway Airport (BNK)",
    "badge": "red",
    "badgeText": "Strikte No-Fly Zone (5,5 km)",
    "desc": "5,5 km Sperrzone um den Flughafen Ballina/Byron Bay. Regelmäßiger Jet- und Helikopterverkehr!"
  },
  {
    "type": "circle",
    "coords": [
      -26.6033,
      153.0911
    ],
    "radius": 5500,
    "color": "#ef4444",
    "fillColor": "#ef4444",
    "fillOpacity": 0.28,
    "title": "Sunshine Coast Airport (MCY)",
    "badge": "red",
    "badgeText": "Strikte No-Fly Zone (5,5 km)",
    "desc": "5,5 km Kontrollzone Maroochydore. Flüge im Anflugkorridor strengstens untersagt."
  },
  {
    "type": "circle",
    "coords": [
      -20.495,
      148.5522
    ],
    "radius": 5500,
    "color": "#ef4444",
    "fillColor": "#ef4444",
    "fillOpacity": 0.28,
    "title": "Whitsunday Coast Airport (PPP)",
    "badge": "red",
    "badgeText": "Strikte No-Fly Zone (5,5 km)",
    "desc": "Proserpine Airport Kontrollzone. 5,5 km Sicherheitsabstand einhalten."
  },
  {
    "type": "circle",
    "coords": [
      -37.669,
      144.841
    ],
    "radius": 5500,
    "color": "#ef4444",
    "fillColor": "#ef4444",
    "fillOpacity": 0.28,
    "title": "Melbourne Tullamarine Airport (MEL)",
    "badge": "red",
    "badgeText": "Strikte No-Fly Zone (5,5 km)",
    "desc": "Internationaler Großflughafen. Drohnenflug ausnahmslos verboten."
  },
  {
    "type": "polygon",
    "coords": [
      [
        -24.7,
        153.15
      ],
      [
        -25.8,
        153.1
      ],
      [
        -25.85,
        153
      ],
      [
        -25.2,
        152.95
      ],
      [
        -24.7,
        153.15
      ]
    ],
    "color": "#dc2626",
    "fillColor": "#ef4444",
    "fillOpacity": 0.35,
    "title": "K'gari (Fraser Island) Nationalpark",
    "badge": "red",
    "badgeText": "Nationalpark: Drohnenverbot",
    "desc": "Queensland Parks & Wildlife Service (QPWS): Drohnen sind auf der gesamten Insel K'gari zum Schutz von Dingos und Vögeln verboten. Ranger verhängen Strafen bis 13.000 AUD!"
  },
  {
    "type": "polygon",
    "coords": [
      [
        -26.375,
        153.085
      ],
      [
        -26.395,
        153.125
      ],
      [
        -26.415,
        153.115
      ],
      [
        -26.395,
        153.08
      ]
    ],
    "color": "#dc2626",
    "fillColor": "#ef4444",
    "fillOpacity": 0.35,
    "title": "Noosa Nationalpark & Headland",
    "badge": "red",
    "badgeText": "Nationalpark: Drohnenverbot",
    "desc": "Beliebter Küstenpfad und Koala-Habitat. Absolutes Flugverbot im gesamten Parkgelände."
  },
  {
    "type": "polygon",
    "coords": [
      [
        -33.6,
        150.2
      ],
      [
        -33.85,
        150.45
      ],
      [
        -33.95,
        150.25
      ],
      [
        -33.7,
        150.15
      ]
    ],
    "color": "#dc2626",
    "fillColor": "#ef4444",
    "fillOpacity": 0.35,
    "title": "Blue Mountains Nationalpark",
    "badge": "red",
    "badgeText": "NSW NPWS: Drohnenverbot",
    "desc": "Three Sisters, Jamison Valley & Wasserfälle: Gesetzliches Drohnenverbot auf allen Aussichtsplattformen und Wanderwegen."
  },
  {
    "type": "polygon",
    "coords": [
      [
        -20.05,
        148.85
      ],
      [
        -20.35,
        149.08
      ],
      [
        -20.45,
        148.95
      ],
      [
        -20.25,
        148.75
      ]
    ],
    "color": "#dc2626",
    "fillColor": "#ef4444",
    "fillOpacity": 0.35,
    "title": "Whitsunday Islands Nationalpark & Whitehaven Beach",
    "badge": "red",
    "badgeText": "Nationalpark: Drohnenverbot",
    "desc": "Whitehaven Beach und die unbewohnten Whitsunday-Inseln sind geschützter Nationalpark. Flüge nur mit spezieller QPWS-Genehmigung erlaubt."
  },
  {
    "type": "polygon",
    "coords": [
      [
        -28.6,
        153.58
      ],
      [
        -28.65,
        153.66
      ],
      [
        -28.72,
        153.62
      ],
      [
        -28.68,
        153.55
      ]
    ],
    "color": "#d97706",
    "fillColor": "#f59e0b",
    "fillOpacity": 0.25,
    "title": "Cape Byron Marine Park",
    "badge": "yellow",
    "badgeText": "Meeresschutz: Wal- & Delfinschutz",
    "desc": "Auflagen: Mindestens 100 Meter Abstand zu Meeressäugern (Wale 300 m). Nicht über Brutkolonien von Seevögeln fliegen. Cape Byron Leuchtturm-Gelände meiden!"
  },
  {
    "type": "spot",
    "coords": [
      -28.8025,
      153.5935
    ],
    "color": "#10b981",
    "title": "Lennox Head (Pat Morton Lookout)",
    "badge": "green",
    "badgeText": "Erlaubt (Crown Land)",
    "desc": "Fantastischer Blick auf Surfer und die Bucht. Liegt außerhalb von Nationalparks. Regeln: Max. 120 m Höhe, min. 30 m Abstand zu Spaziergängern halten!"
  },
  {
    "type": "spot",
    "coords": [
      -25.908,
      153.0964
    ],
    "color": "#10b981",
    "title": "Carlo Sand Blow (Rainbow Beach)",
    "badge": "green",
    "badgeText": "Erlaubter Traum-Spot",
    "desc": "Riesige Sanddüne mit Blick auf Double Island Point und Tin Can Bay. Freies Gelände außerhalb des NP-Kerngebiets. Atemberaubende Drohnen-Panoramen zum Sonnenuntergang!"
  },
  {
    "type": "spot",
    "coords": [
      -28.665,
      153.621
    ],
    "color": "#10b981",
    "title": "Tallow Beach (Byron Bay Süd)",
    "badge": "green",
    "badgeText": "Freigegebener Strandabschnitt",
    "desc": "Breiter Sandstrand südlich des Arakwal Nationalparks. Weitläufig, ideal bei ruhigem Wind. Immer 30 m Distanz zu Badegästen wahren."
  },
  {
    "type": "spot",
    "coords": [
      -20.2675,
      148.718
    ],
    "color": "#10b981",
    "title": "Airlie Beach Public Foreshore",
    "badge": "green",
    "badgeText": "Öffentlicher Uferbereich",
    "desc": "Außerhalb des Whitsunday-Nationalparks. Hafen-Helipads beachten (min. 1 km Abstand) und Menschenmengen an der Lagoon meiden."
  },
  {
    "type": "spot",
    "coords": [
      -32.331,
      152.54
    ],
    "color": "#10b981",
    "title": "Boomerang Beach & Pacific Palms",
    "badge": "green",
    "badgeText": "Erlaubter Küstenabschnitt",
    "desc": "Spektakuläre Brandung und weitläufige Strände. Perfekt für Küstenaufnahmen am Vormittag bei wenig Wind."
  }
];

  // 8. WETTER FALLBACK
  const DEFAULT_FALLBACK_WEATHER = {
  "sydney": {
    "temp": 23,
    "apparentTemp": 23,
    "weatherCode": 1,
    "windSpeed": 16,
    "humidity": 62
  },
  "brisbane": {
    "temp": 27,
    "apparentTemp": 28,
    "weatherCode": 0,
    "windSpeed": 14,
    "humidity": 58
  },
  "melbourne": {
    "temp": 19,
    "apparentTemp": 18,
    "weatherCode": 2,
    "windSpeed": 22,
    "humidity": 55
  }
};

  // 9. LOCALSTORAGE SCHLÜSSEL
  const STORAGE_KEYS = {
  "AUTH_TOKEN": "aus_auth_token",
  "THEME": "aus_theme",
  "BOOKINGS": "aus_roadtrip_bookings_2027",
  "PACKING": "aus_roadtrip_packing_2027",
  "EXPENSES": "aus_roadtrip_expenses_2027",
  "SUB_ITEMS_PAID": "aus_subitems_paid_state_2027",
  "ONSITE_BUDGET": "aus_onsite_budget",
  "JOURNAL": "aus_roadtrip_journal_2027",
  "PHOTOS": "aus_roadtrip_photos_2027",
  "FUEL": "aus_roadtrip_fuel_entries_2027",
  "GROCERIES": "aus_roadtrip_groceries_2027",
  "CHECKBOXES": "aus_roadtrip_checkboxes_2027",
  "SUGGESTIONS": "aus_roadtrip_suggestions_2027",
  "CUSTOM_ACTIVITIES": "aus_roadtrip_custom_activities_2027",
  "OFFLINE_RATE": "aus_last_known_aud_rate",
  "OFFLINE_RATE_TIME": "aus_last_known_aud_rate_time",
  "OFFLINE_WEATHER": "aus_roadtrip_weather_cache_v1",
  "OFFLINE_WEATHER_TIME": "aus_roadtrip_weather_time_v1"
};

  // 10. CIPHER VAULT (AES-256-GCM verschlüsselte Ressourcen)

  return {
    tripData,
    TRIP_DAYS_DATA,
    TRIP_DAYS,
    ACCOMMODATION_DETAILS,
    DAY_PLANNED_EXPENSES,
    ALL_SIGHTSEEING_SPOTS,
    TRIP_DATES_LONG,
    BUDGET_CATEGORIES_CONFIG,
    DEFAULT_EXPENSES_LIST,
    DEFAULT_BOOKINGS_LIST,
    DEFAULT_PACKING_ITEMS,
    PACKING_CATEGORIES,
    ORG_CATEGORY_META,
    DEFAULT_JOURNAL_ENTRIES,
    DEFAULT_PHOTOS_LIST,
    roadtripRoutes,
    flightRoutes,
    regionNames,
    airspaceFeatures,
    DEFAULT_FALLBACK_WEATHER,
    STORAGE_KEYS,
    CIPHER_VAULT: null
  };
}));
