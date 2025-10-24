const axios = require("axios");
const cheerio = require("cheerio");

const BASE_URL = "https://samvidha.iare.ac.in/pages/student/exam_result/ajax/";

module.exports = async (req, res) => {
  const roll = req.query.roll;
  if (!roll) return res.status(400).json({ error: "Roll number required" });

  try {
    const examList = await axios.get(BASE_URL + "examresults", {
      params: { action: "exam_code_list", rollno: roll }
    });

    const exams = examList.data.data || [];
    const results = [];

    for (const exam of exams) {
      const gradeResp = await axios.post(
        BASE_URL + "grade_sheet",
        `rollno=${roll}&exam_code=${exam.exam_code}&action=result_form`,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const $ = cheerio.load(gradeResp.data);
      const rows = $("tr");
      const subjects = [];

      rows.each((i, row) => {
        const cols = $(row)
          .find("td")
          .map((i, el) => $(el).text().trim())
          .get();
        if (cols.length >= 4) {
          subjects.push({
            subject: cols[1],
            credits: cols[2],
            grade: cols[3],
            points: cols[4] || ""
          });
        }
      });

      const text = $.text().toUpperCase();
      let sgpa = text.match(/SGPA[:=\s]*([0-9]+\.[0-9]+)/)?.[1] || null;
      let cgpa = text.match(/CGPA[:=\s]*([0-9]+\.[0-9]+)/)?.[1] || null;

      results.push({
        exam_title: exam.exam_title,
        subjects,
        sgpa,
        cgpa
      });
    }

    res.json({ roll, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch results" });
  }
};
