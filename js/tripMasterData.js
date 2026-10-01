/* =========================================================================
   AUSTRALIEN ROADTRIP 2027 – MASTER DATASTORE (Single Source of Truth)
   Vollständig aggregiertes, kanonisches Datenmodell aller 21 Reisetage,
   Aktivitäten, Spots, Unterkünfte, Buchungen, Finanzen.
   ========================================================================= */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TRIP_MASTER_DATA = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  return {
  "version": 3,
  "exportedAt": "2026-09-30T10:31:17.274Z",
  "tripMeta": {
    "id": "aus-roadtrip-2027",
    "title": "Australien Roadtrip 2027",
    "subtitle": "Von Sydney über Brisbane & Whitsundays bis Melbourne",
    "startDate": "2027-03-20",
    "endDate": "2027-04-09",
    "totalDays": 21,
    "currency": "EUR",
    "defaultRateAudToEur": 0.61,
    "defaultCenter": [
      -28.5,
      148
    ],
    "defaultZoom": 5
  },
  "days": [
  {
    "id": "day-0",
    "dayNumber": 0,
    "date": "2027-03-20",
    "title": "Fahrt nach Wien & Vorübernachtung",
    "region": "Wien",
    "location": "Wien",
    "startLocation": "Wien Hauptbahnhof",
    "destLocation": "Flughafen Wien-Schwechat",
    "startCoords": [
      48.185,
      16.3767
    ],
    "destCoords": [
      48.1103,
      16.5697
    ],
    "centerCoords": [
      48.185,
      16.3767
    ],
    "transportType": "car",
    "programSummary": "Entspannte Anreise nach Wien und Vorübernachtung in Flughafennähe, damit der Langstreckenflug am nächsten Morgen ohne Zeitdruck beginnt."
  },
  {
    "id": "day-1",
    "dayNumber": 1,
    "date": "2027-03-21",
    "title": "Flug ab Wien-Schwechat",
    "location": "Wien / Singapur",
    "startLocation": "Flughafen Wien-Schwechat (VIE)",
    "destLocation": "Sydney Kingsford Smith Airport (SYD)",
    "startCoords": [
      48.1103,
      16.5697
    ],
    "destCoords": [
      -33.9461,
      151.1772
    ],
    "centerCoords": [
      48.1103,
      16.5697
    ],
    "zoom": 6,
    "distance": "ca. 15.900 km",
    "driveTime": "ca. 22–24 Std. Flugzeit",
    "transportType": "plane",
    "accommodationName": "Langstreckenflug (Übernachtung an Bord / Flugzeug)",
    "accommodationId": "acc-1",
    "programSummary": "Flug von Wien (VIE) Richtung Sydney (SYD). Reisedauer: 11 Std. 40 Min. Über Nacht nach Singapur. 3 Std. 15 Min. Zwischenstopp in Singapur (SIN). Reisedauer: 7 Std. 55 Min. nach Sydney.",
    "plannedExpense": {
      "amount": 453,
      "label": "Langstreckenflug Wien → Sydney (gebucht)"
    },
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
    "spotIds": [],
    "region": "Wien / Singapur"
  },
  {
    "id": "day-2",
    "dayNumber": 2,
    "date": "2027-03-22",
    "title": "Ankunft in Sydney (18:50 / Kingsford Smith Airport)",
    "location": "Sydney",
    "startLocation": "Kingsford Smith Airport (SYD)",
    "destLocation": "Darling Harbour & Barangaroo Promenade",
    "startCoords": [
      -33.9461,
      151.1772
    ],
    "destCoords": [
      -33.8695,
      151.201
    ],
    "centerCoords": [
      -33.9461,
      151.1772
    ],
    "zoom": 13,
    "distance": "ca. 12 km",
    "driveTime": "ca. 25 Min. Transfer",
    "transportType": "car",
    "accommodationName": "The Ultimo, Sydney (50 Jones St, Ultimo NSW 2007)",
    "accommodationId": "acc-2",
    "programSummary": "Ankunft am Abend in Sydney, Hotel-Check-in & entspanntes Abendessen am Darling Harbour & Barangaroo Promenade.",
    "plannedExpense": {
      "amount": 150,
      "label": "The Ultimo Sydney Hotel & Transfer"
    },
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
    "spotIds": [
      1
    ],
    "region": "Sydney"
  },
  {
    "id": "day-3",
    "dayNumber": 3,
    "date": "2027-03-23",
    "title": "Sydney – Klassiker am Hafen & Manly Ferry",
    "location": "Sydney",
    "startLocation": "The Ultimo Sydney",
    "destLocation": "Circular Quay & Manly Beach",
    "startCoords": [
      -33.8807,
      151.2034
    ],
    "destCoords": [
      -33.799,
      151.284
    ],
    "centerCoords": [
      -33.8807,
      151.2034
    ],
    "zoom": 12,
    "distance": "ca. 11 km Fähre",
    "driveTime": "ca. 20–30 Min. ÖPNV / Fähre",
    "transportType": "walk",
    "accommodationName": "The Ultimo, Sydney",
    "accommodationId": "acc-3",
    "programSummary": "Vormittags: Circular Quay, Sydney Opera House, Royal Botanic Garden & Mrs Macquarie’s Chair. Mittags: Historisches Viertel The Rocks und zu Fuß über die Sydney Harbour Bridge. Nachmittags: Fährfahrt nach Manly Beach & Sunset.",
    "plannedExpense": {
      "amount": 35,
      "label": "Manly Ferry & The Rocks Harbour Bridge Walk"
    },
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
    "spotIds": [
      2,
      3
    ],
    "region": "Sydney"
  },
  {
    "id": "day-4",
    "dayNumber": 4,
    "date": "2027-03-24",
    "title": "Sydney – Coastal Walk & Trendviertel",
    "location": "Blue Mountains",
    "startLocation": "Bondi Beach & Icebergs Pool",
    "destLocation": "Bondi Beach & Surry Hills",
    "startCoords": [
      -33.8915,
      151.2767
    ],
    "destCoords": [
      -33.8915,
      151.2767
    ],
    "centerCoords": [
      -33.8915,
      151.2767
    ],
    "zoom": 13,
    "distance": "ca. 15 km ÖPNV / 6 km Walk",
    "driveTime": "ca. 25 Min. Bus",
    "transportType": "bus",
    "accommodationName": "The Ultimo, Sydney",
    "accommodationId": "acc-4",
    "programSummary": "Vormittags: Bondi Beach & spektakulärer Bondi to Coogee Coastal Walk. Nachmittags: Café-Kultur, Boutiquen & Street-Art in Surry Hills und Paddington.",
    "plannedExpense": {
      "amount": 40,
      "label": "Bondi Coastal Walk Verpflegung & Cafés"
    },
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
    "spotIds": [
      4,
      5
    ],
    "region": "Blue Mountains"
  },
  {
    "id": "day-5",
    "dayNumber": 5,
    "date": "2027-03-25",
    "title": "Flug nach Ballina / Byron Bay",
    "location": "Sydney / Port Stephens",
    "startLocation": "Sydney Kingsford Smith Airport (SYD)",
    "destLocation": "Cape Byron Lighthouse",
    "startCoords": [
      -33.9461,
      151.1772
    ],
    "destCoords": [
      -28.6384,
      153.6366
    ],
    "centerCoords": [
      -33.9461,
      151.1772
    ],
    "zoom": 10,
    "distance": "ca. 610 km Flug + 30 km Mietwagen",
    "driveTime": "ca. 1 Std. 15 Min. Flug + 25 Min. Fahrt",
    "transportType": "plane",
    "accommodationName": "AirBnB, East Ballina (East Ballina, NSW)",
    "accommodationId": "acc-5",
    "programSummary": "Morgens Flug SYD → BNK (1,5 Std.). Mietwagen am Flughafen übernehmen. Fahrt nach Byron Bay, Check-in und Spätnachmittag am Cape Byron Lighthouse.",
    "plannedExpense": {
      "amount": 205,
      "label": "Inlandsflug SYD → Ballina (125 €) + Mietwagen (80 €)"
    },
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
    "spotIds": [
      6
    ],
    "region": "Sydney / Port Stephens"
  },
  {
    "id": "day-6",
    "dayNumber": 6,
    "date": "2027-03-26",
    "title": "Byron Bay & Erlebnisse am Ozean",
    "location": "Port Stephens / Dorrigo",
    "startLocation": "Wategos Beach & The Pass",
    "destLocation": "Wategos Beach & The Pass",
    "startCoords": [
      -28.636,
      153.628
    ],
    "destCoords": [
      -28.636,
      153.628
    ],
    "centerCoords": [
      -28.636,
      153.628
    ],
    "zoom": 12,
    "distance": "ca. 30 km (je Richtung)",
    "driveTime": "ca. 25 Min. Fahrt",
    "transportType": "ferry",
    "accommodationName": "AirBnB, East Ballina",
    "accommodationId": "acc-6",
    "programSummary": "Vormittags: Geführte Seekajak-Tour (Delfine, Rochen & Meeresschildkröten beobachten!). Nachmittags: Strand-Relaxen am Tallow Beach, Bummel durch die Surfer-Boutiquen und Craft-Bier zum Sonnenuntergang.",
    "plannedExpense": {
      "amount": 65,
      "label": "AirBnB East Ballina & Kajaktour"
    },
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
    "spotIds": [
      7
    ],
    "region": "Port Stephens / Dorrigo"
  },
  {
    "id": "day-7",
    "dayNumber": 7,
    "date": "2027-03-27",
    "title": "Byron Bay → Gold Coast → Brisbane",
    "location": "Dorrigo / Byron Bay",
    "startLocation": "Byron Bay",
    "destLocation": "Howard Smith Wharves & Story Bridge",
    "startCoords": [
      -28.643,
      153.612
    ],
    "destCoords": [
      -27.4608,
      153.036
    ],
    "centerCoords": [
      -28.643,
      153.612
    ],
    "zoom": 9,
    "distance": "ca. 175 km",
    "driveTime": "ca. 2,5 Std. Fahrtzeit",
    "transportType": "car",
    "accommodationName": "Rambla at Story House, Brisbane (Woolloongabba / Kangaroo Point)",
    "accommodationId": "acc-7",
    "programSummary": "Fahrt gen Norden. Zwischenstopp an der Gold Coast: Aussichtspunkt Burleigh Heads oder SkyPoint Q1 Tower. Weiterfahrt nach Brisbane, Check-in und Abend an den belebten Howard Smith Wharves unter der Story Bridge.",
    "plannedExpense": {
      "amount": 120,
      "label": "Hotel Brisbane (95 €) + Sprit Anteil (25 €)"
    },
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
    "spotIds": [
      8,
      9
    ],
    "region": "Dorrigo / Byron Bay"
  },
  {
    "id": "day-8",
    "dayNumber": 8,
    "date": "2027-03-28",
    "title": "Brisbane – Kultur, Fluss & Aussicht",
    "location": "Gold Coast",
    "startLocation": "Hotel Rambla (Woolloongabba)",
    "destLocation": "Mt Coot-tha Summit Lookout",
    "startCoords": [
      -27.485,
      153.033
    ],
    "destCoords": [
      -27.477,
      152.9535
    ],
    "centerCoords": [
      -27.485,
      153.033
    ],
    "zoom": 12,
    "distance": "ca. 18 km",
    "driveTime": "ca. 30 Min. CityCat / Fahrt",
    "transportType": "ferry",
    "accommodationName": "Rambla at Story House, Brisbane",
    "accommodationId": "acc-8",
    "programSummary": "South Bank Parklands (inkl. Streets Beach Lagune), moderne Kunst in der QAGOMA Galerie, Katamaran-Fahrt mit der CityCat-Fähre, Kangaroo Point Cliffs und Panoramablick zum Sonnenuntergang vom Mount Coot-tha.",
    "plannedExpense": {
      "amount": 25,
      "label": "Brisbane CityCat Katamaran & South Bank"
    },
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
    "spotIds": [
      10,
      11
    ],
    "region": "Gold Coast"
  },
  {
    "id": "day-9",
    "dayNumber": 9,
    "date": "2027-03-29",
    "title": "Brisbane – Riverwalk & Urban Lifestyle",
    "location": "Brisbane",
    "startLocation": "Brisbane City",
    "destLocation": "Australia Zoo (Beerwah)",
    "startCoords": [
      -27.4698,
      153.0251
    ],
    "destCoords": [
      -26.837,
      152.961
    ],
    "centerCoords": [
      -27.4698,
      153.0251
    ],
    "zoom": 10,
    "distance": "ca. 150 km (Hin- & Rückweg)",
    "driveTime": "ca. 1 Std. je Richtung",
    "transportType": "walk",
    "accommodationName": "Rambla at Story House, Brisbane",
    "accommodationId": "acc-9",
    "programSummary": "Spaziergang über den Brisbane Riverwalk, Kaffeepause in Fortitude Valley & James Street, Besuch des New Farm Park & Brisbane Powerhouse.",
    "plannedExpense": {
      "amount": 60,
      "label": "Australia Zoo Beerwah Ticket"
    },
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
    "spotIds": [
      12
    ],
    "region": "Brisbane"
  },
  {
    "id": "day-10",
    "dayNumber": 10,
    "date": "2027-03-30",
    "title": "Brisbane – zusätzlicher Stadttag",
    "location": "Brisbane",
    "startLocation": "Queen Street Mall, Brisbane",
    "destLocation": "Howard Smith Wharves, Brisbane",
    "startCoords": [
      -27.4705,
      153.0251
    ],
    "destCoords": [
      -27.463,
      153.0352
    ],
    "centerCoords": [
      -27.4705,
      153.0251
    ],
    "zoom": 9,
    "distance": "ca. 150 km",
    "driveTime": "ca. 2,5 Std. Panoramaroute",
    "transportType": "walk",
    "accommodationName": "Villa Noosa Hotel / Bounce Noosa (Noosaville, QLD)",
    "accommodationId": "acc-10",
    "programSummary": "Ein voller Tag in Brisbane mit Innenstadt, South Bank, Flusspanorama und entspanntem Abend unter der Story Bridge.",
    "plannedExpense": {
      "amount": 90,
      "label": "Villa Noosa Hotel & Nationalpark"
    },
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
    "spotIds": [
      13,
      14
    ],
    "region": "Brisbane"
  },
  {
    "id": "day-11",
    "dayNumber": 11,
    "date": "2027-03-31",
    "title": "Brisbane → Noosa → Rainbow Beach → Hervey Bay",
    "location": "Brisbane / Noosa / Hervey Bay",
    "startLocation": "Brisbane CBD",
    "destLocation": "Hervey Bay (Nightcap at Kondari Resort)",
    "startCoords": [
      -27.4698,
      153.0251
    ],
    "destCoords": [
      -25.2986,
      152.8535
    ],
    "centerCoords": [
      -27.4698,
      153.0251
    ],
    "zoom": 9,
    "distance": "ca. 190 km",
    "driveTime": "ca. 2,5 Std. Fahrtzeit",
    "transportType": "car",
    "accommodationName": "Nightcap at Kondari Resort, Hervey Bay (Hervey Bay, QLD)",
    "accommodationId": "acc-11",
    "programSummary": "Frühe Abfahrt aus Brisbane über Noosa und Rainbow Beach zur Carlo Sand Blow; anschließend Weiterfahrt nach Hervey Bay.",
    "plannedExpense": {
      "amount": 95,
      "label": "Hervey Bay Kondari Resort & Rainbow Beach"
    },
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
    "spotIds": [
      15
    ],
    "region": "Brisbane / Noosa / Hervey Bay"
  },
  {
    "id": "day-12",
    "dayNumber": 12,
    "date": "2027-04-01",
    "title": "K’gari (Fraser Island) & Nachtbus nach Norden",
    "location": "K'gari",
    "startLocation": "Lake McKenzie & Maheno Wreck (K’gari)",
    "destLocation": "K’gari (Lake McKenzie & Maheno Wreck) → Nachtbus",
    "startCoords": [
      -25.449,
      153.058
    ],
    "destCoords": [
      -25.449,
      153.058
    ],
    "centerCoords": [
      -25.449,
      153.058
    ],
    "zoom": 9,
    "distance": "ca. 860 km Nachtbus-Transfer",
    "driveTime": "ca. 11 Std. Nachtbus (Hervey Bay → Airlie Beach)",
    "transportType": "bus",
    "accommodationName": "Greyhound / Premier Nachtbus (Hervey Bay → Airlie Beach)",
    "accommodationId": "acc-12",
    "programSummary": "Ganztägige geführte 4WD-Tour auf K’gari: Lake McKenzie (glasklarer Süßwassersee), 75 Mile Beach Sand-Highway, Maheno Shipwreck & Eli Creek. Abends Mietwagenabgabe in Hervey Bay und Greyhound-Nachtbus nach Airlie Beach.",
    "plannedExpense": {
      "amount": 235,
      "label": "K’gari 4x4 Offroad-Tour (180 €) + Nachtbus (55 €)"
    },
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
    "spotIds": [
      16
    ],
    "region": "K'gari"
  },
  {
    "id": "day-13",
    "dayNumber": 13,
    "date": "2027-04-02",
    "title": "Ankunft Airlie Beach & Whitsundays Helikopter-Rundflug",
    "location": "Hervey Bay / Airlie Beach",
    "startLocation": "Airlie Beach Esplanade & Coral Sea Marina",
    "destLocation": "Airlie Beach Esplanade & Coral Sea Marina",
    "startCoords": [
      -20.2675,
      148.718
    ],
    "destCoords": [
      -20.2675,
      148.718
    ],
    "centerCoords": [
      -20.2675,
      148.718
    ],
    "zoom": 13,
    "distance": "ca. 15 km lokaler Radius",
    "driveTime": "ca. 20 Min. Shuttle",
    "transportType": "helicopter",
    "accommodationName": "Coral Sea Vista Apartments, Airlie Beach (Airlie Beach, QLD)",
    "accommodationId": "acc-13",
    "programSummary": "Morgens Ankunft mit dem Bus in Airlie Beach. Check-in in den Apartments, Schlaf nachholen & Strandlagune erkunden. Am Nachmittag: Spektakulärer Helikopter- / Rundflug über das berühmte Heart Reef & Whitehaven Beach.",
    "plannedExpense": {
      "amount": 330,
      "label": "Coral Sea Vista Whitsundays (110 €) + Heli-Rundflug (220 €)"
    },
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
    "spotIds": [
      17
    ],
    "region": "Hervey Bay / Airlie Beach"
  },
  {
    "id": "day-14",
    "dayNumber": 14,
    "date": "2027-04-03",
    "title": "Whitsundays Highlight-Tag",
    "location": "Whitsundays",
    "startLocation": "Coral Sea Marina (Airlie Beach)",
    "destLocation": "Hill Inlet Lookout & Whitehaven Beach",
    "startCoords": [
      -20.2675,
      148.718
    ],
    "destCoords": [
      -20.285,
      149.038
    ],
    "centerCoords": [
      -20.2675,
      148.718
    ],
    "zoom": 11,
    "distance": "ca. 70 km Katamaran-Seeweg",
    "driveTime": "Ganztagestour Boot",
    "transportType": "ferry",
    "accommodationName": "Coral Sea Vista Apartments, Airlie Beach",
    "accommodationId": "acc-14",
    "programSummary": "Ganztägige Katamaran-Tour zu den Whitsunday Islands: Traumstrand Whitehaven Beach, Hill Inlet Lookout (Sandwirbel) & Schnorcheln am Great Barrier Reef.",
    "plannedExpense": {
      "amount": 145,
      "label": "Whitsundays Segeltour & Whitehaven Beach"
    },
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
    "spotIds": [
      18
    ],
    "region": "Whitsundays"
  },
  {
    "id": "day-15",
    "dayNumber": 15,
    "date": "2027-04-04",
    "title": "Airlie Beach & Umgebung (Cedar Creek Falls / Boardwalk)",
    "location": "Airlie Beach / Melbourne",
    "startLocation": "Cedar Creek Falls & Conway Nationalpark",
    "destLocation": "Cedar Creek Falls (Conway Nationalpark)",
    "startCoords": [
      -20.407,
      148.694
    ],
    "destCoords": [
      -20.407,
      148.694
    ],
    "centerCoords": [
      -20.407,
      148.694
    ],
    "zoom": 11,
    "distance": "ca. 60 km (Hin- & Rückweg)",
    "driveTime": "ca. 35 Min. je Richtung",
    "transportType": "car",
    "accommodationName": "Coral Sea Vista Apartments, Airlie Beach",
    "accommodationId": "acc-15",
    "programSummary": "Entspannter Tag in Airlie Beach: Ausflug zu den natürlichen Rockpools der <i>Cedar Creek Falls</i> im Regenwald, Spaziergang auf dem Bicentennial Boardwalk & Sundowner am Yachthafen.",
    "plannedExpense": {
      "amount": 50,
      "label": "Cedar Creek Falls & Entspannung Whitsundays"
    },
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
    "spotIds": [
      19
    ],
    "region": "Airlie Beach / Melbourne"
  },
  {
    "id": "day-16",
    "dayNumber": 16,
    "date": "2027-04-05",
    "title": "Airlie Beach - Flug nach Melbourne",
    "location": "Melbourne",
    "startLocation": "Whitsunday Coast Airport (PPP)",
    "destLocation": "Melbourne Southbank & Yarra River",
    "startCoords": [
      -20.495,
      148.552
    ],
    "destCoords": [
      -37.8205,
      144.964
    ],
    "centerCoords": [
      -20.495,
      148.552
    ],
    "zoom": 13,
    "distance": "ca. 1.950 km Flug + 22 km Transfer",
    "driveTime": "ca. 3 Std. Flug + 30 Min. Transfer",
    "transportType": "plane",
    "accommodationName": "Vibe Hotel Docklands, Melbourne (Docklands, VIC)",
    "accommodationId": "acc-16",
    "programSummary": "Flug von Proserpine (PPP) nach Melbourne (MEL). Check-in in den Docklands und erster Abend am beleuchteten Yarra River, Federation Square & Southbank.",
    "plannedExpense": {
      "amount": 235,
      "label": "Inlandsflug PPP → MEL (140 €) + Vibe Hotel (95 €)"
    },
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
    "spotIds": [
      20
    ],
    "region": "Melbourne"
  },
  {
    "id": "day-17",
    "dayNumber": 17,
    "date": "2027-04-06",
    "title": "Melbourne – Laneways, Street Art & Pinguine",
    "location": "Great Ocean Road",
    "startLocation": "Vibe Hotel Docklands",
    "destLocation": "St. Kilda Pier (Zwergpinguin-Kolonie)",
    "startCoords": [
      -37.816,
      144.938
    ],
    "destCoords": [
      -37.8645,
      144.968
    ],
    "centerCoords": [
      -37.816,
      144.938
    ],
    "zoom": 12,
    "distance": "ca. 10 km",
    "driveTime": "ca. 25 Min. Tram / ÖPNV",
    "transportType": "train",
    "accommodationName": "Vibe Hotel Docklands, Melbourne",
    "accommodationId": "acc-17",
    "programSummary": "Graffiti-Laneways (Hosier Lane, AC/DC Lane), weltberühmte Café-Kultur, Queen Victoria Market, Royal Botanic Gardens. Abends: Sonnenuntergang & Zwergpinguine am St. Kilda Pier.",
    "plannedExpense": {
      "amount": 125,
      "label": "Vibe Hotel Melbourne (95 €) + Cafés & Pinguine (30 €)"
    },
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
    "spotIds": [
      21,
      22
    ],
    "region": "Great Ocean Road"
  },
  {
    "id": "day-18",
    "dayNumber": 18,
    "date": "2027-04-07",
    "title": "Tagesausflug Great Ocean Road",
    "location": "Great Ocean Road",
    "startLocation": "Melbourne CBD",
    "destLocation": "Twelve Apostles & Loch Ard Gorge",
    "startCoords": [
      -37.8136,
      144.9631
    ],
    "destCoords": [
      -38.6655,
      143.104
    ],
    "centerCoords": [
      -37.8136,
      144.9631
    ],
    "zoom": 9,
    "distance": "ca. 480 km (Hin- & Rückweg)",
    "driveTime": "ca. 6 - 7 Std. Fahrtzeit",
    "transportType": "car",
    "accommodationName": "Vibe Hotel Docklands, Melbourne",
    "accommodationId": "acc-18",
    "programSummary": "Fahrt entlang einer der spektakulärsten Küstenstraßen der Welt: Bells Beach, Memorial Arch, Koalas in Kennett River, Twelve Apostles, Loch Ard Gorge und Gibson Steps.",
    "plannedExpense": {
      "amount": 70,
      "label": "Great Ocean Road Tagestour & Mietwagen Sprit"
    },
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
    "spotIds": [
      23,
      24
    ],
    "region": "Great Ocean Road"
  },
  {
    "id": "day-19",
    "dayNumber": 19,
    "date": "2027-04-08",
    "title": "Melbourne – Brighton Boxes & Fitzroy / Ausklang",
    "location": "Melbourne",
    "startLocation": "Brighton Bathing Boxes",
    "destLocation": "Brighton Beach & Fitzroy",
    "startCoords": [
      -37.9175,
      144.985
    ],
    "destCoords": [
      -37.7985,
      144.9785
    ],
    "centerCoords": [
      -37.9175,
      144.985
    ],
    "zoom": 12,
    "distance": "ca. 30 km",
    "driveTime": "ca. 35 Min. Bahn / Tram",
    "transportType": "train",
    "accommodationName": "Vibe Hotel Docklands, Melbourne",
    "accommodationId": "acc-19",
    "programSummary": "Bunte Brighton Bathing Boxes am Strand, Vintage-Bummel im Trendviertel Fitzroy & Brunswick, National Gallery of Victoria (NGV) und Abschieds-Dinner auf einer Rooftop-Bar.",
    "plannedExpense": {
      "amount": 65,
      "label": "Melbourne Brighton Beach & Fitzroy Rooftop"
    },
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
    "spotIds": [
      25,
      26
    ],
    "region": "Melbourne"
  },
  {
    "id": "day-20",
    "dayNumber": 20,
    "date": "2027-04-09",
    "title": "Rückflug nach Wien",
    "location": "Melbourne",
    "startLocation": "Royal Botanic Gardens Victoria",
    "destLocation": "Melbourne Tullamarine Airport (MEL) → Wien (VIE)",
    "startCoords": [
      -37.8304,
      144.98
    ],
    "destCoords": [
      -37.669,
      144.841
    ],
    "centerCoords": [
      -37.8304,
      144.98
    ],
    "zoom": 11,
    "distance": "ca. 15.900 km Rückflug",
    "driveTime": "ca. 24 Std. Langstreckenflug",
    "transportType": "plane",
    "accommodationName": "Langstreckenflug (Übernachtung an Bord / Flugzeug)",
    "accommodationId": "acc-20",
    "programSummary": "Letzter Aussie-Flat-White am Morgen, Transfer zum Flughafen Melbourne Tullamarine (MEL) und Rückflug nach Wien. Ende eines unvergesslichen Abenteuers!",
    "plannedExpense": {
      "amount": 45,
      "label": "Royal Botanic Gardens & Airport Transfer"
    },
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
    "spotIds": [
      27
    ],
    "region": "Melbourne"
  }
],
  "activities": [
  {
    "id": "act-0-1",
    "dayId": "day-0",
    "dayNumber": 0,
    "time": "16:00",
    "title": "Ankunft Wien Hauptbahnhof",
    "category": "transport",
    "description": "Ankunft in Wien und kurzer Umstieg für die Weiterfahrt zum Flughafen.",
    "locationName": "Wien Hauptbahnhof",
    "coords": [
      48.185,
      16.3767
    ],
    "region": "Wien",
    "transportMode": "car",
    "durationMinutes": 30,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 0
  },
  {
    "id": "act-0-2",
    "dayId": "day-0",
    "dayNumber": 0,
    "time": "17:00",
    "title": "Fahrt zum Flughafen Wien-Schwechat",
    "category": "transport",
    "description": "Transfer vom Wiener Stadtgebiet zum Flughafen Wien-Schwechat.",
    "locationName": "Flughafen Wien-Schwechat",
    "coords": [
      48.1103,
      16.5697
    ],
    "region": "Wien",
    "transportMode": "car",
    "durationMinutes": 30,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 1
  },
  {
    "id": "act-0-3",
    "dayId": "day-0",
    "dayNumber": 0,
    "time": "18:00",
    "title": "Vorübernachtung am Flughafen Wien",
    "category": "hotel",
    "description": "Check-in, Gepäck vorbereiten und ruhig in die Reise starten.",
    "locationName": "Flughafen Wien-Schwechat",
    "coords": [
      48.1103,
      16.5697
    ],
    "region": "Wien",
    "transportMode": "walk",
    "durationMinutes": 720,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 2
  },
  {
    "id": "act-1-1",
    "dayId": "day-1",
    "dayNumber": 1,
    "time": "07:30",
    "title": "Letzter Gepäck-Check & Reisepässe bereitlegen",
    "category": "flight",
    "description": "Flug von Wien (VIE) Richtung Sydney (SYD). Reisedauer: 11 Std. 40 Min. Über Nacht nach Singapur. 3 Std. 15 Min. Zwischenstopp in Singapur (SIN). Reisedauer: 7 Std. 55 Min. nach Sydney.",
    "locationName": "Flughafen Wien-Schwechat (VIE)",
    "coords": [
      48.1103,
      16.5697
    ],
    "region": "Wien / Singapur",
    "transportMode": "plane",
    "durationMinutes": 150,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 0
  },
  {
    "id": "act-1-2",
    "dayId": "day-1",
    "dayNumber": 1,
    "time": "10:00",
    "title": "Treffpunkt Flughafen Wien-Schwechat (VIE) Terminal 3",
    "category": "flight",
    "description": "Flug von Wien (VIE) Richtung Sydney (SYD). Reisedauer: 11 Std. 40 Min. Über Nacht nach Singapur. 3 Std. 15 Min. Zwischenstopp in Singapur (SIN). Reisedauer: 7 Std. 55 Min. nach Sydney.",
    "locationName": "Flughafen Wien-Schwechat (VIE)",
    "coords": [
      48.1103,
      16.5697
    ],
    "region": "Wien / Singapur",
    "transportMode": "plane",
    "durationMinutes": 90,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 1
  },
  {
    "id": "act-1-3",
    "dayId": "day-1",
    "dayNumber": 1,
    "time": "11:30",
    "title": "Boarding Flug Scoot TR 12 nach Singapur (SIN)",
    "category": "flight",
    "description": "Flug von Wien (VIE) Richtung Sydney (SYD). Reisedauer: 11 Std. 40 Min. Über Nacht nach Singapur. 3 Std. 15 Min. Zwischenstopp in Singapur (SIN). Reisedauer: 7 Std. 55 Min. nach Sydney.",
    "locationName": "Sydney Kingsford Smith Airport (SYD)",
    "coords": [
      -33.9461,
      151.1772
    ],
    "region": "Wien / Singapur",
    "transportMode": "plane",
    "durationMinutes": 360,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 2
  },
  {
    "id": "act-1-4",
    "dayId": "day-1",
    "dayNumber": 1,
    "time": "23:45",
    "title": "Zwischenstopp Singapur Changi Jewel & Weiterflug nach Sydney",
    "category": "flight",
    "description": "Flug von Wien (VIE) Richtung Sydney (SYD). Reisedauer: 11 Std. 40 Min. Über Nacht nach Singapur. 3 Std. 15 Min. Zwischenstopp in Singapur (SIN). Reisedauer: 7 Std. 55 Min. nach Sydney.",
    "locationName": "Sydney Kingsford Smith Airport (SYD)",
    "coords": [
      -33.9461,
      151.1772
    ],
    "region": "Wien / Singapur",
    "transportMode": "plane",
    "durationMinutes": 60,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 3
  },
  {
    "id": "act-2-1",
    "dayId": "day-2",
    "dayNumber": 2,
    "time": "18:50",
    "title": "Landung Kingsford Smith Airport Sydney (SYD)",
    "category": "flight",
    "description": "Ankunft am Abend in Sydney, Hotel-Check-in & entspanntes Abendessen am Darling Harbour & Barangaroo Promenade.",
    "locationName": "Kingsford Smith Airport (SYD)",
    "coords": [
      -33.9461,
      151.1772
    ],
    "region": "Sydney",
    "transportMode": "plane",
    "durationMinutes": 85,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 0
  },
  {
    "id": "act-2-2",
    "dayId": "day-2",
    "dayNumber": 2,
    "time": "20:15",
    "title": "Hotel Check-in The Ultimo (Chinatown / Haymarket)",
    "category": "transport",
    "description": "Ankunft am Abend in Sydney, Hotel-Check-in & entspanntes Abendessen am Darling Harbour & Barangaroo Promenade.",
    "locationName": "Sydney",
    "coords": [
      -33.8695,
      151.201
    ],
    "region": "Sydney",
    "transportMode": "car",
    "durationMinutes": 45,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 1
  },
  {
    "id": "act-2-3",
    "dayId": "day-2",
    "dayNumber": 2,
    "time": "21:00",
    "title": "Late Dinner & Drinks an der Barangaroo Promenade",
    "category": "restaurant",
    "description": "Ankunft am Abend in Sydney, Hotel-Check-in & entspanntes Abendessen am Darling Harbour & Barangaroo Promenade.",
    "locationName": "Darling Harbour & Barangaroo Promenade",
    "coords": [
      -33.8695,
      151.201
    ],
    "region": "sydney",
    "transportMode": "walk",
    "durationMinutes": 60,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 2
  },
  {
    "id": "act-3-1",
    "dayId": "day-3",
    "dayNumber": 3,
    "time": "09:00",
    "title": "Brekkie & Flat White am Circular Quay mit Blick auf die Oper",
    "category": "sightseeing",
    "description": "Vormittags: Circular Quay, Sydney Opera House, Royal Botanic Garden & Mrs Macquarie’s Chair. Mittags: Historisches Viertel The Rocks und zu Fuß über die Sydney Harbour Bridge. Nachmittags: Fährfahrt nach Manly Beach & Sunset.",
    "locationName": "The Ultimo Sydney",
    "coords": [
      -33.8807,
      151.2034
    ],
    "region": "Sydney",
    "transportMode": "walk",
    "durationMinutes": 210,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 0
  },
  {
    "id": "act-3-2",
    "dayId": "day-3",
    "dayNumber": 3,
    "time": "12:30",
    "title": "Historischer Bummel durch The Rocks & Spaziergang über die Harbour Bridge",
    "category": "sightseeing",
    "description": "Vormittags: Circular Quay, Sydney Opera House, Royal Botanic Garden & Mrs Macquarie’s Chair. Mittags: Historisches Viertel The Rocks und zu Fuß über die Sydney Harbour Bridge. Nachmittags: Fährfahrt nach Manly Beach & Sunset.",
    "locationName": "The Rocks & Harbour Bridge Pylon Walk",
    "coords": [
      -33.859,
      151.2085
    ],
    "region": "sydney",
    "transportMode": "walk",
    "durationMinutes": 240,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 1
  },
  {
    "id": "act-3-3",
    "dayId": "day-3",
    "dayNumber": 3,
    "time": "16:30",
    "title": "Manly Ferry ab Wharf 3 (traumhafte Sunset-Fahrt durch den Hafen)",
    "category": "transport",
    "description": "Vormittags: Circular Quay, Sydney Opera House, Royal Botanic Garden & Mrs Macquarie’s Chair. Mittags: Historisches Viertel The Rocks und zu Fuß über die Sydney Harbour Bridge. Nachmittags: Fährfahrt nach Manly Beach & Sunset.",
    "locationName": "Sydney",
    "coords": [
      -33.859,
      151.2085
    ],
    "region": "Sydney",
    "transportMode": "ferry",
    "durationMinutes": 180,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 2
  },
  {
    "id": "act-3-4",
    "dayId": "day-3",
    "dayNumber": 3,
    "time": "19:30",
    "title": "Dinner am Manly Corso & nächtliche Rückfahrt",
    "category": "transport",
    "description": "Vormittags: Circular Quay, Sydney Opera House, Royal Botanic Garden & Mrs Macquarie’s Chair. Mittags: Historisches Viertel The Rocks und zu Fuß über die Sydney Harbour Bridge. Nachmittags: Fährfahrt nach Manly Beach & Sunset.",
    "locationName": "Circular Quay & Manly Beach",
    "coords": [
      -33.799,
      151.284
    ],
    "region": "Sydney",
    "transportMode": "car",
    "durationMinutes": 60,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 3
  },
  {
    "id": "act-4-1",
    "dayId": "day-4",
    "dayNumber": 4,
    "time": "09:30",
    "title": "Coastal Walk ab Bondi Beach starten (Richtung Bronte / Coogee)",
    "category": "sightseeing",
    "description": "Vormittags: Bondi Beach & spektakulärer Bondi to Coogee Coastal Walk. Nachmittags: Café-Kultur, Boutiquen & Street-Art in Surry Hills und Paddington.",
    "locationName": "Bondi Beach & Icebergs Pool",
    "coords": [
      -33.8915,
      151.2767
    ],
    "region": "sydney",
    "transportMode": "walk",
    "durationMinutes": 210,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 0
  },
  {
    "id": "act-4-2",
    "dayId": "day-4",
    "dayNumber": 4,
    "time": "13:00",
    "title": "Mittagssnack & Flat White mit Ozeanblick",
    "category": "sightseeing",
    "description": "Vormittags: Bondi Beach & spektakulärer Bondi to Coogee Coastal Walk. Nachmittags: Café-Kultur, Boutiquen & Street-Art in Surry Hills und Paddington.",
    "locationName": "Blue Mountains",
    "coords": [
      -33.8915,
      151.2767
    ],
    "region": "Blue Mountains",
    "transportMode": "walk",
    "durationMinutes": 60,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 1
  },
  {
    "id": "act-4-3",
    "dayId": "day-4",
    "dayNumber": 4,
    "time": "14:00",
    "title": "Vintage-Bummel & Cafés in Surry Hills (Crown St)",
    "category": "sightseeing",
    "description": "Vormittags: Bondi Beach & spektakulärer Bondi to Coogee Coastal Walk. Nachmittags: Café-Kultur, Boutiquen & Street-Art in Surry Hills und Paddington.",
    "locationName": "Surry Hills & Paddington (Crown St)",
    "coords": [
      -33.886,
      151.2135
    ],
    "region": "sydney",
    "transportMode": "walk",
    "durationMinutes": 270,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 2
  },
  {
    "id": "act-4-4",
    "dayId": "day-4",
    "dayNumber": 4,
    "time": "18:30",
    "title": "Abendessen & Rooftop-Drinks in Darlinghurst",
    "category": "restaurant",
    "description": "Vormittags: Bondi Beach & spektakulärer Bondi to Coogee Coastal Walk. Nachmittags: Café-Kultur, Boutiquen & Street-Art in Surry Hills und Paddington.",
    "locationName": "Bondi Beach & Surry Hills",
    "coords": [
      -33.8915,
      151.2767
    ],
    "region": "Blue Mountains",
    "transportMode": "walk",
    "durationMinutes": 60,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 3
  },
  {
    "id": "act-5-1",
    "dayId": "day-5",
    "dayNumber": 5,
    "time": "08:00",
    "title": "Check-out The Ultimo Sydney &amp; Transfer zum Flughafen",
    "category": "flight",
    "description": "Morgens Flug SYD → BNK (1,5 Std.). Mietwagen am Flughafen übernehmen. Fahrt nach Byron Bay, Check-in und Spätnachmittag am Cape Byron Lighthouse.",
    "locationName": "Sydney Kingsford Smith Airport (SYD)",
    "coords": [
      -33.9461,
      151.1772
    ],
    "region": "Sydney / Port Stephens",
    "transportMode": "plane",
    "durationMinutes": 145,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 0
  },
  {
    "id": "act-5-2",
    "dayId": "day-5",
    "dayNumber": 5,
    "time": "10:25",
    "title": "Flug Jetstar JQ 458 nach Ballina Byron Gateway (BNK)",
    "category": "flight",
    "description": "Morgens Flug SYD → BNK (1,5 Std.). Mietwagen am Flughafen übernehmen. Fahrt nach Byron Bay, Check-in und Spätnachmittag am Cape Byron Lighthouse.",
    "locationName": "Cape Byron Lighthouse",
    "coords": [
      -28.6384,
      153.6366
    ],
    "region": "byron",
    "transportMode": "plane",
    "durationMinutes": 155,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 1
  },
  {
    "id": "act-5-3",
    "dayId": "day-5",
    "dayNumber": 5,
    "time": "13:00",
    "title": "Mietwagenübernahme am Flughafen Ballina &amp; Fahrt nach Byron Bay",
    "category": "flight",
    "description": "Morgens Flug SYD → BNK (1,5 Std.). Mietwagen am Flughafen übernehmen. Fahrt nach Byron Bay, Check-in und Spätnachmittag am Cape Byron Lighthouse.",
    "locationName": "Cape Byron Lighthouse",
    "coords": [
      -28.6384,
      153.6366
    ],
    "region": "byron",
    "transportMode": "plane",
    "durationMinutes": 180,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 2
  },
  {
    "id": "act-5-4",
    "dayId": "day-5",
    "dayNumber": 5,
    "time": "16:00",
    "title": "Sonnenuntergang am Cape Byron Lighthouse &amp; Lookout",
    "category": "sightseeing",
    "description": "Morgens Flug SYD → BNK (1,5 Std.). Mietwagen am Flughafen übernehmen. Fahrt nach Byron Bay, Check-in und Spätnachmittag am Cape Byron Lighthouse.",
    "locationName": "Cape Byron Lighthouse",
    "coords": [
      -28.6384,
      153.6366
    ],
    "region": "byron",
    "transportMode": "walk",
    "durationMinutes": 60,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 3
  },
  {
    "id": "act-6-1",
    "dayId": "day-6",
    "dayNumber": 6,
    "time": "08:30",
    "title": "Geführte Delfin-Kajaktour ab Main Beach Byron Bay",
    "category": "transport",
    "description": "Vormittags: Geführte Seekajak-Tour (Delfine, Rochen & Meeresschildkröten beobachten!). Nachmittags: Strand-Relaxen am Tallow Beach, Bummel durch die Surfer-Boutiquen und Craft-Bier zum Sonnenuntergang.",
    "locationName": "Wategos Beach & The Pass",
    "coords": [
      -28.636,
      153.628
    ],
    "region": "byron",
    "transportMode": "ferry",
    "durationMinutes": 330,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 0
  },
  {
    "id": "act-6-2",
    "dayId": "day-6",
    "dayNumber": 6,
    "time": "14:00",
    "title": "Chillen & Surfen am The Pass & Wategos Beach",
    "category": "sightseeing",
    "description": "Vormittags: Geführte Seekajak-Tour (Delfine, Rochen & Meeresschildkröten beobachten!). Nachmittags: Strand-Relaxen am Tallow Beach, Bummel durch die Surfer-Boutiquen und Craft-Bier zum Sonnenuntergang.",
    "locationName": "Wategos Beach & The Pass",
    "coords": [
      -28.636,
      153.628
    ],
    "region": "byron",
    "transportMode": "walk",
    "durationMinutes": 270,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 1
  },
  {
    "id": "act-6-3",
    "dayId": "day-6",
    "dayNumber": 6,
    "time": "18:30",
    "title": "Beach Hotel Live-Musik, Craft Beer & entspanntes Abendessen",
    "category": "sightseeing",
    "description": "Vormittags: Geführte Seekajak-Tour (Delfine, Rochen & Meeresschildkröten beobachten!). Nachmittags: Strand-Relaxen am Tallow Beach, Bummel durch die Surfer-Boutiquen und Craft-Bier zum Sonnenuntergang.",
    "locationName": "Wategos Beach & The Pass",
    "coords": [
      -28.636,
      153.628
    ],
    "region": "byron",
    "transportMode": "walk",
    "durationMinutes": 60,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 2
  },
  {
    "id": "act-7-1",
    "dayId": "day-7",
    "dayNumber": 7,
    "time": "09:30",
    "title": "Abfahrt Byron Bay Richtung Norden über den Pacific Highway",
    "category": "transport",
    "description": "Fahrt gen Norden. Zwischenstopp an der Gold Coast: Aussichtspunkt Burleigh Heads oder SkyPoint Q1 Tower. Weiterfahrt nach Brisbane, Check-in und Abend an den belebten Howard Smith Wharves unter der Story Bridge.",
    "locationName": "Byron Bay",
    "coords": [
      -28.643,
      153.612
    ],
    "region": "Dorrigo / Byron Bay",
    "transportMode": "car",
    "durationMinutes": 120,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 0
  },
  {
    "id": "act-7-2",
    "dayId": "day-7",
    "dayNumber": 7,
    "time": "11:30",
    "title": "Stopp Surfers Paradise & Strandspaziergang Burleigh Heads",
    "category": "sightseeing",
    "description": "Fahrt gen Norden. Zwischenstopp an der Gold Coast: Aussichtspunkt Burleigh Heads oder SkyPoint Q1 Tower. Weiterfahrt nach Brisbane, Check-in und Abend an den belebten Howard Smith Wharves unter der Story Bridge.",
    "locationName": "Burleigh Heads Lookout",
    "coords": [
      -28.0933,
      153.456
    ],
    "region": "byron",
    "transportMode": "walk",
    "durationMinutes": 270,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 1
  },
  {
    "id": "act-7-3",
    "dayId": "day-7",
    "dayNumber": 7,
    "time": "16:00",
    "title": "Check-in Hotel Rambla @ South City Square Brisbane",
    "category": "transport",
    "description": "Fahrt gen Norden. Zwischenstopp an der Gold Coast: Aussichtspunkt Burleigh Heads oder SkyPoint Q1 Tower. Weiterfahrt nach Brisbane, Check-in und Abend an den belebten Howard Smith Wharves unter der Story Bridge.",
    "locationName": "Dorrigo / Byron Bay",
    "coords": [
      -27.4608,
      153.036
    ],
    "region": "Dorrigo / Byron Bay",
    "transportMode": "car",
    "durationMinutes": 180,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 2
  },
  {
    "id": "act-7-4",
    "dayId": "day-7",
    "dayNumber": 7,
    "time": "19:00",
    "title": "Craft Beer & Dinner bei den Howard Smith Wharves",
    "category": "restaurant",
    "description": "Fahrt gen Norden. Zwischenstopp an der Gold Coast: Aussichtspunkt Burleigh Heads oder SkyPoint Q1 Tower. Weiterfahrt nach Brisbane, Check-in und Abend an den belebten Howard Smith Wharves unter der Story Bridge.",
    "locationName": "Howard Smith Wharves & Story Bridge",
    "coords": [
      -27.4608,
      153.036
    ],
    "region": "brisbane",
    "transportMode": "walk",
    "durationMinutes": 60,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 3
  },
  {
    "id": "act-8-1",
    "dayId": "day-8",
    "dayNumber": 8,
    "time": "10:00",
    "title": "CityCat Katamaran-Fahrt auf dem Brisbane River",
    "category": "transport",
    "description": "South Bank Parklands (inkl. Streets Beach Lagune), moderne Kunst in der QAGOMA Galerie, Katamaran-Fahrt mit der CityCat-Fähre, Kangaroo Point Cliffs und Panoramablick zum Sonnenuntergang vom Mount Coot-tha.",
    "locationName": "Hotel Rambla (Woolloongabba)",
    "coords": [
      -27.485,
      153.033
    ],
    "region": "Gold Coast",
    "transportMode": "ferry",
    "durationMinutes": 210,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 0
  },
  {
    "id": "act-8-2",
    "dayId": "day-8",
    "dayNumber": 8,
    "time": "13:30",
    "title": "Mittagspause & Spaziergang South Bank Parklands",
    "category": "sightseeing",
    "description": "South Bank Parklands (inkl. Streets Beach Lagune), moderne Kunst in der QAGOMA Galerie, Katamaran-Fahrt mit der CityCat-Fähre, Kangaroo Point Cliffs und Panoramablick zum Sonnenuntergang vom Mount Coot-tha.",
    "locationName": "South Bank Parklands & Streets Beach",
    "coords": [
      -27.4785,
      153.0205
    ],
    "region": "brisbane",
    "transportMode": "walk",
    "durationMinutes": 300,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 1
  },
  {
    "id": "act-8-3",
    "dayId": "day-8",
    "dayNumber": 8,
    "time": "18:30",
    "title": "Sunset & Panoramadinner am Mt Coot-tha Summit Lookout",
    "category": "restaurant",
    "description": "South Bank Parklands (inkl. Streets Beach Lagune), moderne Kunst in der QAGOMA Galerie, Katamaran-Fahrt mit der CityCat-Fähre, Kangaroo Point Cliffs und Panoramablick zum Sonnenuntergang vom Mount Coot-tha.",
    "locationName": "Mt Coot-tha Summit Lookout",
    "coords": [
      -27.477,
      152.9535
    ],
    "region": "brisbane",
    "transportMode": "walk",
    "durationMinutes": 60,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 2
  },
  {
    "id": "act-9-1",
    "dayId": "day-9",
    "dayNumber": 9,
    "time": "08:30",
    "title": "Abfahrt Brisbane Richtung Sunshine Coast Hinterland",
    "category": "transport",
    "description": "Spaziergang über den Brisbane Riverwalk, Kaffeepause in Fortitude Valley & James Street, Besuch des New Farm Park & Brisbane Powerhouse.",
    "locationName": "Brisbane City",
    "coords": [
      -27.4698,
      153.0251
    ],
    "region": "Brisbane",
    "transportMode": "car",
    "durationMinutes": 60,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 0
  },
  {
    "id": "act-9-2",
    "dayId": "day-9",
    "dayNumber": 9,
    "time": "09:30",
    "title": "Eintritt Australia Zoo & Kängurus füttern in den offenen Gehegen",
    "category": "sightseeing",
    "description": "Spaziergang über den Brisbane Riverwalk, Kaffeepause in Fortitude Valley & James Street, Besuch des New Farm Park & Brisbane Powerhouse.",
    "locationName": "Australia Zoo (Home of the Crocodile Hunter)",
    "coords": [
      -26.837,
      152.961
    ],
    "region": "brisbane",
    "transportMode": "walk",
    "durationMinutes": 150,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 1
  },
  {
    "id": "act-9-3",
    "dayId": "day-9",
    "dayNumber": 9,
    "time": "12:00",
    "title": "Wildlife Warriors Show im Crocoseum (Krokodile, Vögel & Schlangen)",
    "category": "sightseeing",
    "description": "Spaziergang über den Brisbane Riverwalk, Kaffeepause in Fortitude Valley & James Street, Besuch des New Farm Park & Brisbane Powerhouse.",
    "locationName": "Brisbane",
    "coords": [
      -26.837,
      152.961
    ],
    "region": "Brisbane",
    "transportMode": "walk",
    "durationMinutes": 300,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 2
  },
  {
    "id": "act-9-4",
    "dayId": "day-9",
    "dayNumber": 9,
    "time": "17:00",
    "title": "Rückfahrt nach Brisbane & entspanntes Abendessen",
    "category": "transport",
    "description": "Spaziergang über den Brisbane Riverwalk, Kaffeepause in Fortitude Valley & James Street, Besuch des New Farm Park & Brisbane Powerhouse.",
    "locationName": "Australia Zoo (Beerwah)",
    "coords": [
      -26.837,
      152.961
    ],
    "region": "Brisbane",
    "transportMode": "car",
    "durationMinutes": 60,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 3
  },
  {
    "id": "act-10-1",
    "dayId": "day-10",
    "dayNumber": 10,
    "time": "09:00",
    "title": "Queen Street Mall & Brisbane CBD",
    "category": "sightseeing",
    "description": "Spaziergang durch die Innenstadt und Frühstück im CBD.",
    "locationName": "Queen Street Mall, Brisbane",
    "coords": [
      -27.4705,
      153.0251
    ],
    "region": "Brisbane",
    "transportMode": "walk",
    "durationMinutes": 120,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 0
  },
  {
    "id": "act-10-2",
    "dayId": "day-10",
    "dayNumber": 10,
    "time": "11:30",
    "title": "South Bank Parklands",
    "category": "sightseeing",
    "description": "Parkanlagen, Promenade und Blick über den Brisbane River.",
    "locationName": "South Bank Parklands, Brisbane",
    "coords": [
      -27.4811,
      153.0234
    ],
    "region": "Brisbane",
    "transportMode": "ferry",
    "durationMinutes": 150,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 1
  },
  {
    "id": "act-10-3",
    "dayId": "day-10",
    "dayNumber": 10,
    "time": "15:00",
    "title": "Kangaroo Point Cliffs",
    "category": "sightseeing",
    "description": "Aussicht auf Skyline und Brisbane River.",
    "locationName": "Kangaroo Point Cliffs, Brisbane",
    "coords": [
      -27.4765,
      153.0365
    ],
    "region": "Brisbane",
    "transportMode": "walk",
    "durationMinutes": 120,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 2
  },
  {
    "id": "act-10-4",
    "dayId": "day-10",
    "dayNumber": 10,
    "time": "18:00",
    "title": "Howard Smith Wharves",
    "category": "restaurant",
    "description": "Abendessen und Sonnenuntergang unterhalb der Story Bridge.",
    "locationName": "Howard Smith Wharves, Brisbane",
    "coords": [
      -27.463,
      153.0352
    ],
    "region": "Brisbane",
    "transportMode": "ferry",
    "durationMinutes": 180,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 3
  },
  {
    "id": "act-11-1",
    "dayId": "day-11",
    "dayNumber": 11,
    "time": "07:00",
    "title": "Abfahrt Brisbane Richtung Noosa",
    "category": "transport",
    "description": "Früher Start für die Küstenetappe nach Norden.",
    "locationName": "Brisbane CBD",
    "coords": [
      -27.4698,
      153.0251
    ],
    "region": "Brisbane / Noosa / Hervey Bay",
    "transportMode": "car",
    "durationMinutes": 120,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 0
  },
  {
    "id": "act-11-2",
    "dayId": "day-11",
    "dayNumber": 11,
    "time": "13:00",
    "title": "Fahrt nach Rainbow Beach entlang der Küste",
    "category": "transport",
    "description": "Frühe Abfahrt aus Brisbane über Noosa und Rainbow Beach zur Carlo Sand Blow; anschließend Weiterfahrt nach Hervey Bay.",
    "locationName": "Brisbane / Noosa / Hervey Bay",
    "coords": [
      -25.908,
      153.0964
    ],
    "region": "Brisbane / Noosa / Hervey Bay",
    "transportMode": "car",
    "durationMinutes": 90,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 1
  },
  {
    "id": "act-11-3",
    "dayId": "day-11",
    "dayNumber": 11,
    "time": "14:30",
    "title": "Erkundung der Carlo Sand Blow Riesensanddüne",
    "category": "sightseeing",
    "description": "Frühe Abfahrt aus Brisbane über Noosa und Rainbow Beach zur Carlo Sand Blow; anschließend Weiterfahrt nach Hervey Bay.",
    "locationName": "Carlo Sand Blow",
    "coords": [
      -25.908,
      153.0964
    ],
    "region": "islands",
    "transportMode": "walk",
    "durationMinutes": 210,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 2
  },
  {
    "id": "act-11-4",
    "dayId": "day-11",
    "dayNumber": 11,
    "time": "18:00",
    "title": "Check-in Fraser Coast Top Tourist Park in Hervey Bay",
    "category": "transport",
    "description": "Frühe Abfahrt aus Brisbane über Noosa und Rainbow Beach zur Carlo Sand Blow; anschließend Weiterfahrt nach Hervey Bay.",
    "locationName": "Hervey Bay (Nightcap at Kondari Resort)",
    "coords": [
      -25.2986,
      152.8535
    ],
    "region": "Brisbane / Noosa / Hervey Bay",
    "transportMode": "car",
    "durationMinutes": 60,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 3
  },
  {
    "id": "act-12-1",
    "dayId": "day-12",
    "dayNumber": 12,
    "time": "07:30",
    "title": "Abfahrt ganztägige 4WD-Explorer-Tour nach K'gari (Fraser Island)",
    "category": "transport",
    "description": "Ganztägige geführte 4WD-Tour auf K’gari: Lake McKenzie (glasklarer Süßwassersee), 75 Mile Beach Sand-Highway, Maheno Shipwreck & Eli Creek. Abends Mietwagenabgabe in Hervey Bay und Greyhound-Nachtbus nach Airlie Beach.",
    "locationName": "Lake McKenzie & Maheno Wreck (K’gari)",
    "coords": [
      -25.449,
      153.058
    ],
    "region": "islands",
    "transportMode": "ferry",
    "durationMinutes": 210,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 0
  },
  {
    "id": "act-12-2",
    "dayId": "day-12",
    "dayNumber": 12,
    "time": "11:00",
    "title": "Baden im kristallklaren Lake McKenzie",
    "category": "sightseeing",
    "description": "Ganztägige geführte 4WD-Tour auf K’gari: Lake McKenzie (glasklarer Süßwassersee), 75 Mile Beach Sand-Highway, Maheno Shipwreck & Eli Creek. Abends Mietwagenabgabe in Hervey Bay und Greyhound-Nachtbus nach Airlie Beach.",
    "locationName": "Lake McKenzie & Maheno Wreck (K’gari)",
    "coords": [
      -25.449,
      153.058
    ],
    "region": "islands",
    "transportMode": "walk",
    "durationMinutes": 180,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 1
  },
  {
    "id": "act-12-3",
    "dayId": "day-12",
    "dayNumber": 12,
    "time": "14:00",
    "title": "Fahrt über den 75 Mile Beach Highway zum Maheno Schiffswrack",
    "category": "transport",
    "description": "Ganztägige geführte 4WD-Tour auf K’gari: Lake McKenzie (glasklarer Süßwassersee), 75 Mile Beach Sand-Highway, Maheno Shipwreck & Eli Creek. Abends Mietwagenabgabe in Hervey Bay und Greyhound-Nachtbus nach Airlie Beach.",
    "locationName": "Lake McKenzie & Maheno Wreck (K’gari)",
    "coords": [
      -25.449,
      153.058
    ],
    "region": "islands",
    "transportMode": "car",
    "durationMinutes": 180,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 2
  },
  {
    "id": "act-12-4",
    "dayId": "day-12",
    "dayNumber": 12,
    "time": "17:00",
    "title": "Rückkehr Hervey Bay & Mietwagen-Rückgabe",
    "category": "transport",
    "description": "Ganztägige geführte 4WD-Tour auf K’gari: Lake McKenzie (glasklarer Süßwassersee), 75 Mile Beach Sand-Highway, Maheno Shipwreck & Eli Creek. Abends Mietwagenabgabe in Hervey Bay und Greyhound-Nachtbus nach Airlie Beach.",
    "locationName": "K’gari (Lake McKenzie & Maheno Wreck) → Nachtbus",
    "coords": [
      -25.449,
      153.058
    ],
    "region": "K'gari",
    "transportMode": "car",
    "durationMinutes": 180,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 3
  },
  {
    "id": "act-12-5",
    "dayId": "day-12",
    "dayNumber": 12,
    "time": "20:00",
    "title": "Einstieg in den Greyhound Nachtbus nach Airlie Beach",
    "category": "sightseeing",
    "description": "Ganztägige geführte 4WD-Tour auf K’gari: Lake McKenzie (glasklarer Süßwassersee), 75 Mile Beach Sand-Highway, Maheno Shipwreck & Eli Creek. Abends Mietwagenabgabe in Hervey Bay und Greyhound-Nachtbus nach Airlie Beach.",
    "locationName": "K’gari (Lake McKenzie & Maheno Wreck) → Nachtbus",
    "coords": [
      -25.449,
      153.058
    ],
    "region": "K'gari",
    "transportMode": "walk",
    "durationMinutes": 60,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 4
  },
  {
    "id": "act-13-1",
    "dayId": "day-13",
    "dayNumber": 13,
    "time": "06:30",
    "title": "Ankunft Greyhound Nachtbus in Airlie Beach & leckeres Frühstück",
    "category": "restaurant",
    "description": "Morgens Ankunft mit dem Bus in Airlie Beach. Check-in in den Apartments, Schlaf nachholen & Strandlagune erkunden. Am Nachmittag: Spektakulärer Helikopter- / Rundflug über das berühmte Heart Reef & Whitehaven Beach.",
    "locationName": "Airlie Beach Esplanade & Coral Sea Marina",
    "coords": [
      -20.2675,
      148.718
    ],
    "region": "islands",
    "transportMode": "walk",
    "durationMinutes": 210,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 0
  },
  {
    "id": "act-13-2",
    "dayId": "day-13",
    "dayNumber": 13,
    "time": "10:00",
    "title": "Frühes Check-in / Gepäckabgabe Whitsunday Terraces Resort",
    "category": "transport",
    "description": "Morgens Ankunft mit dem Bus in Airlie Beach. Check-in in den Apartments, Schlaf nachholen & Strandlagune erkunden. Am Nachmittag: Spektakulärer Helikopter- / Rundflug über das berühmte Heart Reef & Whitehaven Beach.",
    "locationName": "Hervey Bay / Airlie Beach",
    "coords": [
      -20.2675,
      148.718
    ],
    "region": "Hervey Bay / Airlie Beach",
    "transportMode": "car",
    "durationMinutes": 240,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 1
  },
  {
    "id": "act-13-3",
    "dayId": "day-13",
    "dayNumber": 13,
    "time": "14:00",
    "title": "Spektakulärer Helikopter-Rundflug über das Heart Reef & Whitehaven Beach",
    "category": "flight",
    "description": "Morgens Ankunft mit dem Bus in Airlie Beach. Check-in in den Apartments, Schlaf nachholen & Strandlagune erkunden. Am Nachmittag: Spektakulärer Helikopter- / Rundflug über das berühmte Heart Reef & Whitehaven Beach.",
    "locationName": "Airlie Beach Esplanade & Coral Sea Marina",
    "coords": [
      -20.2675,
      148.718
    ],
    "region": "islands",
    "transportMode": "plane",
    "durationMinutes": 270,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 2
  },
  {
    "id": "act-13-4",
    "dayId": "day-13",
    "dayNumber": 13,
    "time": "18:30",
    "title": "Entspanntes Abendessen an der Esplanade",
    "category": "sightseeing",
    "description": "Morgens Ankunft mit dem Bus in Airlie Beach. Check-in in den Apartments, Schlaf nachholen & Strandlagune erkunden. Am Nachmittag: Spektakulärer Helikopter- / Rundflug über das berühmte Heart Reef & Whitehaven Beach.",
    "locationName": "Airlie Beach Esplanade & Coral Sea Marina",
    "coords": [
      -20.2675,
      148.718
    ],
    "region": "islands",
    "transportMode": "walk",
    "durationMinutes": 60,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 3
  },
  {
    "id": "act-14-1",
    "dayId": "day-14",
    "dayNumber": 14,
    "time": "08:00",
    "title": "Boarding Katamaran-Segeltour ab Coral Sea Marina",
    "category": "flight",
    "description": "Ganztägige Katamaran-Tour zu den Whitsunday Islands: Traumstrand Whitehaven Beach, Hill Inlet Lookout (Sandwirbel) & Schnorcheln am Great Barrier Reef.",
    "locationName": "Coral Sea Marina (Airlie Beach)",
    "coords": [
      -20.2675,
      148.718
    ],
    "region": "Whitsundays",
    "transportMode": "plane",
    "durationMinutes": 210,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 0
  },
  {
    "id": "act-14-2",
    "dayId": "day-14",
    "dayNumber": 14,
    "time": "11:30",
    "title": "Wanderung zum weltberühmten Hill Inlet Aussichtspunkt",
    "category": "sightseeing",
    "description": "Ganztägige Katamaran-Tour zu den Whitsunday Islands: Traumstrand Whitehaven Beach, Hill Inlet Lookout (Sandwirbel) & Schnorcheln am Great Barrier Reef.",
    "locationName": "Hill Inlet Lookout & Whitehaven Beach",
    "coords": [
      -20.285,
      149.038
    ],
    "region": "islands",
    "transportMode": "walk",
    "durationMinutes": 90,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 1
  },
  {
    "id": "act-14-3",
    "dayId": "day-14",
    "dayNumber": 14,
    "time": "13:00",
    "title": "Strandzeit & Schnorcheln am Whitehaven Beach",
    "category": "transport",
    "description": "Ganztägige Katamaran-Tour zu den Whitsunday Islands: Traumstrand Whitehaven Beach, Hill Inlet Lookout (Sandwirbel) & Schnorcheln am Great Barrier Reef.",
    "locationName": "Hill Inlet Lookout & Whitehaven Beach",
    "coords": [
      -20.285,
      149.038
    ],
    "region": "islands",
    "transportMode": "ferry",
    "durationMinutes": 270,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 2
  },
  {
    "id": "act-14-4",
    "dayId": "day-14",
    "dayNumber": 14,
    "time": "17:30",
    "title": "Rückkehr nach Airlie Beach & Sundowner Drinks",
    "category": "restaurant",
    "description": "Ganztägige Katamaran-Tour zu den Whitsunday Islands: Traumstrand Whitehaven Beach, Hill Inlet Lookout (Sandwirbel) & Schnorcheln am Great Barrier Reef.",
    "locationName": "Hill Inlet Lookout & Whitehaven Beach",
    "coords": [
      -20.285,
      149.038
    ],
    "region": "islands",
    "transportMode": "walk",
    "durationMinutes": 60,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 3
  },
  {
    "id": "act-15-1",
    "dayId": "day-15",
    "dayNumber": 15,
    "time": "10:00",
    "title": "Ausflug & Erfrischungsbad bei den Cedar Creek Falls",
    "category": "flight",
    "description": "Entspannter Tag in Airlie Beach: Ausflug zu den natürlichen Rockpools der <i>Cedar Creek Falls</i> im Regenwald, Spaziergang auf dem Bicentennial Boardwalk & Sundowner am Yachthafen.",
    "locationName": "Cedar Creek Falls & Conway Nationalpark",
    "coords": [
      -20.407,
      148.694
    ],
    "region": "islands",
    "transportMode": "plane",
    "durationMinutes": 240,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 0
  },
  {
    "id": "act-15-2",
    "dayId": "day-15",
    "dayNumber": 15,
    "time": "14:00",
    "title": "Chillen an der kostenfreien Airlie Beach Lagoon",
    "category": "sightseeing",
    "description": "Entspannter Tag in Airlie Beach: Ausflug zu den natürlichen Rockpools der <i>Cedar Creek Falls</i> im Regenwald, Spaziergang auf dem Bicentennial Boardwalk & Sundowner am Yachthafen.",
    "locationName": "Airlie Beach / Melbourne",
    "coords": [
      -20.407,
      148.694
    ],
    "region": "Airlie Beach / Melbourne",
    "transportMode": "walk",
    "durationMinutes": 240,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 1
  },
  {
    "id": "act-15-3",
    "dayId": "day-15",
    "dayNumber": 15,
    "time": "18:00",
    "title": "Sunset Seafood Dinner am Hafen",
    "category": "restaurant",
    "description": "Entspannter Tag in Airlie Beach: Ausflug zu den natürlichen Rockpools der <i>Cedar Creek Falls</i> im Regenwald, Spaziergang auf dem Bicentennial Boardwalk & Sundowner am Yachthafen.",
    "locationName": "Cedar Creek Falls (Conway Nationalpark)",
    "coords": [
      -20.407,
      148.694
    ],
    "region": "Airlie Beach / Melbourne",
    "transportMode": "walk",
    "durationMinutes": 60,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 2
  },
  {
    "id": "act-16-1",
    "dayId": "day-16",
    "dayNumber": 16,
    "time": "08:30",
    "title": "Transfer zum Whitsunday Coast Airport (PPP)",
    "category": "flight",
    "description": "Flug von Proserpine (PPP) nach Melbourne (MEL). Check-in in den Docklands und erster Abend am beleuchteten Yarra River, Federation Square & Southbank.",
    "locationName": "Whitsunday Coast Airport (PPP)",
    "coords": [
      -20.495,
      148.552
    ],
    "region": "Melbourne",
    "transportMode": "plane",
    "durationMinutes": 165,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 0
  },
  {
    "id": "act-16-2",
    "dayId": "day-16",
    "dayNumber": 16,
    "time": "11:15",
    "title": "Flug Jetstar JQ 843 direkt nach Melbourne (MEL)",
    "category": "flight",
    "description": "Flug von Proserpine (PPP) nach Melbourne (MEL). Check-in in den Docklands und erster Abend am beleuchteten Yarra River, Federation Square & Southbank.",
    "locationName": "Melbourne Southbank & Yarra River",
    "coords": [
      -37.8205,
      144.964
    ],
    "region": "melbourne",
    "transportMode": "plane",
    "durationMinutes": 225,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 1
  },
  {
    "id": "act-16-3",
    "dayId": "day-16",
    "dayNumber": 16,
    "time": "15:00",
    "title": "Check-in Hotel The Sebel Melbourne Docklands",
    "category": "transport",
    "description": "Flug von Proserpine (PPP) nach Melbourne (MEL). Check-in in den Docklands und erster Abend am beleuchteten Yarra River, Federation Square & Southbank.",
    "locationName": "Melbourne Southbank & Yarra River",
    "coords": [
      -37.8205,
      144.964
    ],
    "region": "melbourne",
    "transportMode": "car",
    "durationMinutes": 180,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 2
  },
  {
    "id": "act-16-4",
    "dayId": "day-16",
    "dayNumber": 16,
    "time": "18:00",
    "title": "Spaziergang am Yarra River &amp; Dinner in Southbank",
    "category": "restaurant",
    "description": "Flug von Proserpine (PPP) nach Melbourne (MEL). Check-in in den Docklands und erster Abend am beleuchteten Yarra River, Federation Square & Southbank.",
    "locationName": "Melbourne Southbank & Yarra River",
    "coords": [
      -37.8205,
      144.964
    ],
    "region": "melbourne",
    "transportMode": "walk",
    "durationMinutes": 60,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 3
  },
  {
    "id": "act-17-1",
    "dayId": "day-17",
    "dayNumber": 17,
    "time": "09:30",
    "title": "Kulinarischer Rundgang über den Queen Victoria Market",
    "category": "train",
    "description": "Graffiti-Laneways (Hosier Lane, AC/DC Lane), weltberühmte Café-Kultur, Queen Victoria Market, Royal Botanic Gardens. Abends: Sonnenuntergang & Zwergpinguine am St. Kilda Pier.",
    "locationName": "Vibe Hotel Docklands",
    "coords": [
      -37.816,
      144.938
    ],
    "region": "Great Ocean Road",
    "transportMode": "train",
    "durationMinutes": 270,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 0
  },
  {
    "id": "act-17-2",
    "dayId": "day-17",
    "dayNumber": 17,
    "time": "14:00",
    "title": "Laneway-Bummel, Vintage & Flat Whites in der Degraves Street",
    "category": "sightseeing",
    "description": "Graffiti-Laneways (Hosier Lane, AC/DC Lane), weltberühmte Café-Kultur, Queen Victoria Market, Royal Botanic Gardens. Abends: Sonnenuntergang & Zwergpinguine am St. Kilda Pier.",
    "locationName": "Great Ocean Road",
    "coords": [
      -37.8645,
      144.968
    ],
    "region": "Great Ocean Road",
    "transportMode": "walk",
    "durationMinutes": 240,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 1
  },
  {
    "id": "act-17-3",
    "dayId": "day-17",
    "dayNumber": 17,
    "time": "18:00",
    "title": "Sonnenuntergang & Pinguine beobachten am St. Kilda Pier",
    "category": "sightseeing",
    "description": "Graffiti-Laneways (Hosier Lane, AC/DC Lane), weltberühmte Café-Kultur, Queen Victoria Market, Royal Botanic Gardens. Abends: Sonnenuntergang & Zwergpinguine am St. Kilda Pier.",
    "locationName": "St. Kilda Pier (Zwergpinguin-Kolonie)",
    "coords": [
      -37.8645,
      144.968
    ],
    "region": "melbourne",
    "transportMode": "walk",
    "durationMinutes": 60,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 2
  },
  {
    "id": "act-18-1",
    "dayId": "day-18",
    "dayNumber": 18,
    "time": "07:00",
    "title": "Frühstart ab Melbourne auf die legendäre Great Ocean Road",
    "category": "transport",
    "description": "Fahrt entlang einer der spektakulärsten Küstenstraßen der Welt: Bells Beach, Memorial Arch, Koalas in Kennett River, Twelve Apostles, Loch Ard Gorge und Gibson Steps.",
    "locationName": "Melbourne CBD",
    "coords": [
      -37.8136,
      144.9631
    ],
    "region": "Great Ocean Road",
    "transportMode": "car",
    "durationMinutes": 180,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 0
  },
  {
    "id": "act-18-2",
    "dayId": "day-18",
    "dayNumber": 18,
    "time": "10:00",
    "title": "Fotostopp am Memorial Arch & Bells Beach",
    "category": "sightseeing",
    "description": "Fahrt entlang einer der spektakulärsten Küstenstraßen der Welt: Bells Beach, Memorial Arch, Koalas in Kennett River, Twelve Apostles, Loch Ard Gorge und Gibson Steps.",
    "locationName": "Great Ocean Road",
    "coords": [
      -38.6655,
      143.104
    ],
    "region": "Great Ocean Road",
    "transportMode": "walk",
    "durationMinutes": 150,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 1
  },
  {
    "id": "act-18-3",
    "dayId": "day-18",
    "dayNumber": 18,
    "time": "12:30",
    "title": "Koalas sichten am Kennett River",
    "category": "sightseeing",
    "description": "Fahrt entlang einer der spektakulärsten Küstenstraßen der Welt: Bells Beach, Memorial Arch, Koalas in Kennett River, Twelve Apostles, Loch Ard Gorge und Gibson Steps.",
    "locationName": "Kennett River (Wilde Koalas)",
    "coords": [
      -38.673,
      143.864
    ],
    "region": "melbourne",
    "transportMode": "walk",
    "durationMinutes": 120,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 2
  },
  {
    "id": "act-18-4",
    "dayId": "day-18",
    "dayNumber": 18,
    "time": "14:30",
    "title": "Ankunft bei den Twelve Apostles & Loch Ard Gorge",
    "category": "sightseeing",
    "description": "Fahrt entlang einer der spektakulärsten Küstenstraßen der Welt: Bells Beach, Memorial Arch, Koalas in Kennett River, Twelve Apostles, Loch Ard Gorge und Gibson Steps.",
    "locationName": "Twelve Apostles & Loch Ard Gorge",
    "coords": [
      -38.6655,
      143.104
    ],
    "region": "melbourne",
    "transportMode": "walk",
    "durationMinutes": 360,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 3
  },
  {
    "id": "act-18-5",
    "dayId": "day-18",
    "dayNumber": 18,
    "time": "20:30",
    "title": "Rückkehr nach Melbourne",
    "category": "sightseeing",
    "description": "Fahrt entlang einer der spektakulärsten Küstenstraßen der Welt: Bells Beach, Memorial Arch, Koalas in Kennett River, Twelve Apostles, Loch Ard Gorge und Gibson Steps.",
    "locationName": "Twelve Apostles & Loch Ard Gorge",
    "coords": [
      -38.6655,
      143.104
    ],
    "region": "Great Ocean Road",
    "transportMode": "walk",
    "durationMinutes": 60,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 4
  },
  {
    "id": "act-19-1",
    "dayId": "day-19",
    "dayNumber": 19,
    "time": "10:00",
    "title": "Fotostopp & Strandspaziergang bei den Brighton Bathing Boxes",
    "category": "train",
    "description": "Bunte Brighton Bathing Boxes am Strand, Vintage-Bummel im Trendviertel Fitzroy & Brunswick, National Gallery of Victoria (NGV) und Abschieds-Dinner auf einer Rooftop-Bar.",
    "locationName": "Brighton Bathing Boxes",
    "coords": [
      -37.9175,
      144.985
    ],
    "region": "melbourne",
    "transportMode": "train",
    "durationMinutes": 240,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 0
  },
  {
    "id": "act-19-2",
    "dayId": "day-19",
    "dayNumber": 19,
    "time": "14:00",
    "title": "Vintage-Shopping & Cafés in Fitzroy",
    "category": "sightseeing",
    "description": "Bunte Brighton Bathing Boxes am Strand, Vintage-Bummel im Trendviertel Fitzroy & Brunswick, National Gallery of Victoria (NGV) und Abschieds-Dinner auf einer Rooftop-Bar.",
    "locationName": "Fitzroy (Brunswick & Gertrude Street)",
    "coords": [
      -37.7985,
      144.9785
    ],
    "region": "melbourne",
    "transportMode": "walk",
    "durationMinutes": 330,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 1
  },
  {
    "id": "act-19-3",
    "dayId": "day-19",
    "dayNumber": 19,
    "time": "19:30",
    "title": "Großes Abschlussdinner auf einer Rooftop-Bar mit Skylineblick",
    "category": "restaurant",
    "description": "Bunte Brighton Bathing Boxes am Strand, Vintage-Bummel im Trendviertel Fitzroy & Brunswick, National Gallery of Victoria (NGV) und Abschieds-Dinner auf einer Rooftop-Bar.",
    "locationName": "Brighton Beach & Fitzroy",
    "coords": [
      -37.7985,
      144.9785
    ],
    "region": "Melbourne",
    "transportMode": "walk",
    "durationMinutes": 60,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 2
  },
  {
    "id": "act-20-1",
    "dayId": "day-20",
    "dayNumber": 20,
    "time": "10:00",
    "title": "Gemütliches letztes australisches Brekkie & Souvenirs packen",
    "category": "flight",
    "description": "Letzter Aussie-Flat-White am Morgen, Transfer zum Flughafen Melbourne Tullamarine (MEL) und Rückflug nach Wien. Ende eines unvergesslichen Abenteuers!",
    "locationName": "Royal Botanic Gardens Victoria",
    "coords": [
      -37.8304,
      144.98
    ],
    "region": "Melbourne",
    "transportMode": "plane",
    "durationMinutes": 180,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 0
  },
  {
    "id": "act-20-2",
    "dayId": "day-20",
    "dayNumber": 20,
    "time": "13:00",
    "title": "Check-out & Transfer zum Flughafen Melbourne Tullamarine (MEL)",
    "category": "flight",
    "description": "Letzter Aussie-Flat-White am Morgen, Transfer zum Flughafen Melbourne Tullamarine (MEL) und Rückflug nach Wien. Ende eines unvergesslichen Abenteuers!",
    "locationName": "Melbourne",
    "coords": [
      -37.8304,
      144.98
    ],
    "region": "Melbourne",
    "transportMode": "plane",
    "durationMinutes": 210,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 1
  },
  {
    "id": "act-20-3",
    "dayId": "day-20",
    "dayNumber": 20,
    "time": "16:30",
    "title": "Heimflug Scoot TR 19 nach Singapur & Weiterflug nach Wien",
    "category": "flight",
    "description": "Letzter Aussie-Flat-White am Morgen, Transfer zum Flughafen Melbourne Tullamarine (MEL) und Rückflug nach Wien. Ende eines unvergesslichen Abenteuers!",
    "locationName": "Melbourne Tullamarine Airport (MEL) → Wien (VIE)",
    "coords": [
      -37.669,
      144.841
    ],
    "region": "Melbourne",
    "transportMode": "plane",
    "durationMinutes": 60,
    "isCompleted": false,
    "notes": "",
    "orderIndex": 2
  }
],
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
  ],
  "accommodations": [
    {
      "id": "acc-1",
      "dayNumber": 1,
      "name": "Langstreckenflug Scoot TR 12",
      "address": "Flughafen Wien (VIE) → Singapur (SIN) → Sydney (SYD)",
      "location": "Flugzeug / Transit",
      "checkIn": "Boarding 09:15 Uhr",
      "checkOut": "Landung 18:50 Uhr (Tag 2)",
      "bookingUrl": "",
      "bookingLabel": "Flug TR 12 gebucht",
      "type": "flight",
      "priceAud": 0,
      "priceEur": 0,
      "coords": null
    },
    {
      "id": "acc-2",
      "dayNumber": 2,
      "name": "The Ultimo, Sydney",
      "address": "50 Jones St, Ultimo NSW 2007 (Chinatown / Haymarket)",
      "location": "Sydney (NSW)",
      "checkIn": "ab 14:00 Uhr",
      "checkOut": "bis 11:00 Uhr (am 25.03.)",
      "bookingUrl": "https://www.theultimo.com.au",
      "bookingLabel": "Hotel Website (The Ultimo)",
      "type": "hotel",
      "priceAud": 0,
      "priceEur": 0,
      "coords": null
    },
    {
      "id": "acc-3",
      "dayNumber": 3,
      "name": "The Ultimo, Sydney",
      "address": "50 Jones St, Ultimo NSW 2007 (Chinatown / Haymarket)",
      "location": "Sydney (NSW)",
      "checkIn": "Bereits eingecheckt",
      "checkOut": "bis 11:00 Uhr (am 25.03.)",
      "bookingUrl": "https://www.theultimo.com.au",
      "bookingLabel": "Hotel Website (The Ultimo)",
      "type": "hotel",
      "priceAud": 0,
      "priceEur": 0,
      "coords": null
    },
    {
      "id": "acc-4",
      "dayNumber": 4,
      "name": "The Ultimo, Sydney",
      "address": "50 Jones St, Ultimo NSW 2007 (Chinatown / Haymarket)",
      "location": "Sydney (NSW)",
      "checkIn": "Bereits eingecheckt",
      "checkOut": "Morgen bis 11:00 Uhr",
      "bookingUrl": "https://www.theultimo.com.au",
      "bookingLabel": "Hotel Website (The Ultimo)",
      "type": "hotel",
      "priceAud": 0,
      "priceEur": 0,
      "coords": null
    },
    {
      "id": "acc-5",
      "dayNumber": 5,
      "name": "AirBnB East Ballina",
      "address": "East Ballina, NSW 2478",
      "location": "East Ballina / Byron Bay (NSW)",
      "checkIn": "ab 15:00 Uhr",
      "checkOut": "bis 10:00 Uhr (am 27.03.)",
      "bookingUrl": "https://www.airbnb.at/rooms/1065553106126009714",
      "bookingLabel": "AirBnB Buchung öffnen",
      "type": "airbnb",
      "priceAud": 0,
      "priceEur": 0,
      "coords": null
    },
    {
      "id": "acc-6",
      "dayNumber": 6,
      "name": "AirBnB East Ballina",
      "address": "East Ballina, NSW 2478",
      "location": "East Ballina / Byron Bay (NSW)",
      "checkIn": "Bereits eingecheckt",
      "checkOut": "Morgen bis 10:00 Uhr",
      "bookingUrl": "https://www.airbnb.at/rooms/1065553106126009714",
      "bookingLabel": "AirBnB Buchung öffnen",
      "type": "airbnb",
      "priceAud": 0,
      "priceEur": 0,
      "coords": null
    },
    {
      "id": "acc-7",
      "dayNumber": 7,
      "name": "Rambla at Story House",
      "address": "Woolloongabba / Kangaroo Point, Brisbane QLD",
      "location": "Brisbane City (QLD)",
      "checkIn": "ab 14:00 Uhr",
      "checkOut": "bis 10:00 Uhr (am 30.03.)",
      "bookingUrl": "https://www.rambla.com.au/locations/story-house",
      "bookingLabel": "Rambla Hotel Website",
      "type": "hotel",
      "priceAud": 0,
      "priceEur": 0,
      "coords": null
    },
    {
      "id": "acc-8",
      "dayNumber": 8,
      "name": "Rambla at Story House",
      "address": "Woolloongabba / Kangaroo Point, Brisbane QLD",
      "location": "Brisbane City (QLD)",
      "checkIn": "Bereits eingecheckt",
      "checkOut": "bis 10:00 Uhr (am 30.03.)",
      "bookingUrl": "https://www.rambla.com.au/locations/story-house",
      "bookingLabel": "Rambla Hotel Website",
      "type": "hotel",
      "priceAud": 0,
      "priceEur": 0,
      "coords": null
    },
    {
      "id": "acc-9",
      "dayNumber": 9,
      "name": "Rambla at Story House",
      "address": "Woolloongabba / Kangaroo Point, Brisbane QLD",
      "location": "Brisbane City (QLD)",
      "checkIn": "Bereits eingecheckt",
      "checkOut": "Morgen bis 10:00 Uhr",
      "bookingUrl": "https://www.rambla.com.au/locations/story-house",
      "bookingLabel": "Rambla Hotel Website",
      "type": "hotel",
      "priceAud": 0,
      "priceEur": 0,
      "coords": null
    },
    {
      "id": "acc-10",
      "dayNumber": 10,
      "name": "Villa Noosa Hotel",
      "address": "19 Mary St, Noosaville QLD 4566",
      "location": "Noosa Heads / Noosaville (QLD)",
      "checkIn": "ab 14:00 Uhr",
      "checkOut": "Morgen bis 10:00 Uhr",
      "bookingUrl": "https://www.villanoosa.com.au",
      "bookingLabel": "Villa Noosa Website",
      "type": "hotel",
      "priceAud": 0,
      "priceEur": 0,
      "coords": null
    },
    {
      "id": "acc-11",
      "dayNumber": 11,
      "name": "Nightcap at Kondari Resort",
      "address": "49-63 Elizabeth St, Urangan QLD 4655",
      "location": "Hervey Bay (QLD)",
      "checkIn": "ab 14:00 Uhr",
      "checkOut": "Morgen bis 10:00 Uhr",
      "bookingUrl": "https://nightcap.nighteliercollective.com.au",
      "bookingLabel": "Kondari Resort Website",
      "type": "hotel",
      "priceAud": 0,
      "priceEur": 0,
      "coords": null
    },
    {
      "id": "acc-12",
      "dayNumber": 12,
      "name": "Greyhound Australia Nachtbus",
      "address": "Fraser Coast (Hervey Bay) ➔ Airlie Beach",
      "location": "K’gari Fraser Island / Nachtbus",
      "checkIn": "Abfahrt 20:30 Uhr",
      "checkOut": "Ankunft ca. 08:30 Uhr (Tag 13)",
      "bookingUrl": "https://www.greyhound.com.au",
      "bookingLabel": "Greyhound Bus Ticket",
      "type": "bus",
      "priceAud": 0,
      "priceEur": 0,
      "coords": null
    },
    {
      "id": "acc-13",
      "dayNumber": 13,
      "name": "Coral Sea Vista Apartments",
      "address": "20 The Esplanade, Airlie Beach QLD 4802",
      "location": "Airlie Beach (QLD)",
      "checkIn": "ab 14:00 Uhr (Gepäckabgabe morgens)",
      "checkOut": "bis 10:00 Uhr (am 05.04.)",
      "bookingUrl": "https://www.booking.com/hotel/au/coral-sea-vista-apartments.de.html",
      "bookingLabel": "Booking.com Buchung",
      "type": "hotel",
      "priceAud": 0,
      "priceEur": 0,
      "coords": null
    },
    {
      "id": "acc-14",
      "dayNumber": 14,
      "name": "Coral Sea Vista Apartments",
      "address": "20 The Esplanade, Airlie Beach QLD 4802",
      "location": "Airlie Beach (QLD)",
      "checkIn": "Bereits eingecheckt",
      "checkOut": "bis 10:00 Uhr (am 05.04.)",
      "bookingUrl": "https://www.booking.com/hotel/au/coral-sea-vista-apartments.de.html",
      "bookingLabel": "Booking.com Buchung",
      "type": "hotel",
      "priceAud": 0,
      "priceEur": 0,
      "coords": null
    },
    {
      "id": "acc-15",
      "dayNumber": 15,
      "name": "Coral Sea Vista Apartments",
      "address": "20 The Esplanade, Airlie Beach QLD 4802",
      "location": "Airlie Beach (QLD)",
      "checkIn": "Bereits eingecheckt",
      "checkOut": "Morgen bis 10:00 Uhr",
      "bookingUrl": "https://www.booking.com/hotel/au/coral-sea-vista-apartments.de.html",
      "bookingLabel": "Booking.com Buchung",
      "type": "hotel",
      "priceAud": 0,
      "priceEur": 0,
      "coords": null
    },
    {
      "id": "acc-16",
      "dayNumber": 16,
      "name": "Vibe Hotel Melbourne Docklands",
      "address": "44 Aquitania Way, Docklands VIC 3008",
      "location": "Melbourne Docklands (VIC)",
      "checkIn": "ab 14:00 Uhr",
      "checkOut": "bis 11:00 Uhr (am 09.04.)",
      "bookingUrl": "https://vibehotels.com",
      "bookingLabel": "Vibe Hotel Website",
      "type": "hotel",
      "priceAud": 0,
      "priceEur": 0,
      "coords": null
    },
    {
      "id": "acc-17",
      "dayNumber": 17,
      "name": "Vibe Hotel Melbourne Docklands",
      "address": "44 Aquitania Way, Docklands VIC 3008",
      "location": "Melbourne Docklands (VIC)",
      "checkIn": "Bereits eingecheckt",
      "checkOut": "bis 11:00 Uhr (am 09.04.)",
      "bookingUrl": "https://vibehotels.com",
      "bookingLabel": "Vibe Hotel Website",
      "type": "hotel",
      "priceAud": 0,
      "priceEur": 0,
      "coords": null
    },
    {
      "id": "acc-18",
      "dayNumber": 18,
      "name": "Vibe Hotel Melbourne Docklands",
      "address": "44 Aquitania Way, Docklands VIC 3008",
      "location": "Melbourne Docklands (VIC)",
      "checkIn": "Bereits eingecheckt",
      "checkOut": "bis 11:00 Uhr (am 09.04.)",
      "bookingUrl": "https://vibehotels.com",
      "bookingLabel": "Vibe Hotel Website",
      "type": "hotel",
      "priceAud": 0,
      "priceEur": 0,
      "coords": null
    },
    {
      "id": "acc-19",
      "dayNumber": 19,
      "name": "Vibe Hotel Melbourne Docklands",
      "address": "44 Aquitania Way, Docklands VIC 3008",
      "location": "Melbourne Docklands (VIC)",
      "checkIn": "Bereits eingecheckt",
      "checkOut": "Morgen bis 11:00 Uhr",
      "bookingUrl": "https://vibehotels.com",
      "bookingLabel": "Vibe Hotel Website",
      "type": "hotel",
      "priceAud": 0,
      "priceEur": 0,
      "coords": null
    },
    {
      "id": "acc-20",
      "dayNumber": 20,
      "name": "Rückflug nach Wien (Scoot TR 25)",
      "address": "Melbourne Tullamarine Airport (MEL)",
      "location": "Flughafen / Rückflug",
      "checkIn": "Check-in ab 18:00 Uhr",
      "checkOut": "Landung in Wien (Tag 21)",
      "bookingUrl": "",
      "bookingLabel": "Flug TR 25 gebucht",
      "type": "flight",
      "priceAud": 0,
      "priceEur": 0,
      "coords": null
    }
  ],
  "bookings": [
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
  ],
  "expenses": [
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
  ],
  "packing": [
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
  ],
  "photos": [
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
  ],
  "routes": {
    "roadtripRoutes": [
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
    ],
    "flightRoutes": [
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
    ]
  },

  "weather": {
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
  },
  "cipherVault": "ThR/FNJqnlHxJA5qHW+zJb1NJ8p4bioKKh0+Sm2OM+pap2SPauSZNMWRADsI6aGmEA3tlarePe7OtB74DXc+UmTYv/CgUm4SI/EfECdfi+ZxQVkkWEnxHPYGeF4yCSKssokh3YpdcXHu4/GhXhlfTZZCTYQP97YLwjqMQuP3PnP20TAAt0JhuA+/xGCGfQpoEYwY1r4g7gDo1MzH95ja/aoEdN1A34kRpRZj5X7nyRkd"
};
}));
