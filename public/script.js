// Tab switching
const docTab = document.getElementById("docTab");
const resTab = document.getElementById("resTab");
const docSection = document.getElementById("docSection");
const resSection = document.getElementById("resSection");

docTab.onclick = () => { docTab.classList.add("active"); resTab.classList.remove("active"); docSection.classList.remove("hidden"); resSection.classList.add("hidden"); };
resTab.onclick = () => { resTab.classList.add("active"); docTab.classList.remove("active"); resSection.classList.remove("hidden"); docSection.classList.add("hidden"); };

// Documents tab
document.getElementById("docForm").addEventListener("submit", e => {
  e.preventDefault();
  const roll = document.getElementById("rollNo").value.trim();
  const type = document.getElementById("docType").value;
  if (!roll || !type) return alert("Enter roll & type");

  let url = "";
  if (type === "PHOTO") url = `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${roll}/${roll}.jpg`;
  else if (type === "FIELDPROJECT") url = `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/FIELDPROJECT/2024-25_${roll}_FM.pdf`;
  else url = `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${roll}/DOCS/${roll}_${type}.jpg`;

  const box = document.getElementById("resultBox");
  box.style.display = "block";

  if (url.endsWith(".pdf")) {
    box.innerHTML = `<a href="${url}" target="_blank">Open PDF</a><br><iframe src="${url}" width="100%" height="400px"></iframe>`;
  } else {
    box.innerHTML = `<img src="${url}" alt="Document" style="max-width:100%;" onerror="this.src='https://via.placeholder.com/400x300?text=Not+Found'">`;
  }
});

// Results tab
document.getElementById("resForm").addEventListener("submit", async e => {
  e.preventDefault();
  const roll = document.getElementById("resRoll").value.trim();
  if (!roll) return alert("Enter roll number");

  const box = document.getElementById("resBox");
  box.style.display = "block";
  box.innerHTML = "Loading...";

  try {
    const res = await fetch(`/api/results?roll=${roll}`);
    const data = await res.json();
    if (data.error) { box.innerHTML = `<p style="color:red;">${data.error}</p>`; return; }

    let html = "";
    data.results.forEach(exam => {
      html += `<h3>${exam.exam_title}</h3>`;
      html += `<table><tr><th>Subject</th><th>Credits</th><th>Grade</th><th>Points</th></tr>`;
      exam.subjects.forEach(sub => {
        html += `<tr>
          <td>${sub.subject}</td>
          <td>${sub.credits}</td>
          <td class="grade-${sub.grade.replace('+','plus')}">${sub.grade}</td>
          <td>${sub.points}</td>
        </tr>`;
      });
      html += `</table>`;
      html += `<p>SGPA: <b>${exam.sgpa || "N/A"}</b> | CGPA: <b>${exam.cgpa || "N/A"}</b></p><hr>`;
    });
    box.innerHTML = html;

  } catch(err) {
    box.innerHTML = `<p style="color:red;">Failed to fetch results.</p>`;
    console.error(err);
  }
});
