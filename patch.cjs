const fs = require("fs");
let content = fs.readFileSync("src/components/TableIndexView.tsx", "utf8");

content = content.replace("Showing {filteredTables.length} of 19 Tables", "Showing {filteredTables.length} of 25 Tables");
content = content.replace("JH1-JH19 Registry", "JH1-JH25 Registry");
content = content.replace("Strictly Indexed JH1 to JH19", "Strictly Indexed JH1 to JH25");

const newTables = `
    },
    {
      table_number: 10,
      jh_id: "JH20",
      title: "Jaimini Argalas",
      source_origin: "Jaimini Engine",
      section_key: "Jaimini.argalas",
      api_source: "Computed Client-side / JHora Mapper",
      is_populated: true,
      data_sample: {
        houses: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
      }
    },
    {
      table_number: 15,
      jh_id: "JH21",
      title: "Jaimini Sphutas",
      source_origin: "Jaimini Engine",
      section_key: "Jaimini.sphutas",
      api_source: "Computed Client-side / JHora Mapper",
      is_populated: true,
      data_sample: {
        lagnas: ["Hora Lagna", "Ghati Lagna", "Bhava Lagna", "Pranapada Lagna"]
      }
    },
    {
      table_number: 17,
      jh_id: "JH22",
      title: "Jaimini Sahams",
      source_origin: "Jaimini Engine",
      section_key: "Jaimini.sahams",
      api_source: "Computed Client-side / JHora Mapper",
      is_populated: true,
      data_sample: {
        sahams: ["Punya", "Vidya", "Yasas", "Mitra"]
      }
    },
    {
      table_number: 18,
      jh_id: "JH23",
      title: "Vedic Upgrahas",
      source_origin: "Vedic Engine",
      section_key: "Vedic.upgrahas",
      api_source: "Computed Client-side / JHora Mapper",
      is_populated: true,
      data_sample: {
        upgrahas: ["Gulika", "Mandi", "Dhooma", "Vyatipata"]
      }
    },
    {
      table_number: 22,
      jh_id: "JH24",
      title: "Ishtaphala & Kashtaphala",
      source_origin: "Vedic Engine",
      section_key: "Vedic.phalas",
      api_source: "Computed Client-side / JHora Mapper",
      is_populated: true,
      data_sample: {
        status: "Strengths matrix"
      }
    },
    {
      table_number: 23,
      jh_id: "JH25",
      title: "Jaimini Chara Dasha",
      source_origin: "Jaimini Engine",
      section_key: "Jaimini.chara_dasha",
      api_source: "Computed Client-side / JHora Mapper",
      is_populated: true,
      data_sample: {
        dashas: ["Aries", "Taurus", "Gemini", "Cancer"]
      }
    }
  ];`;

content = content.replace("    }\n  ];", newTables);

fs.writeFileSync("src/components/TableIndexView.tsx", content);
