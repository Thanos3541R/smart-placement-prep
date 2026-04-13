/* ============================================================
   SMART PLACEMENT PREP — Application Logic
   ============================================================ */

(function () {
  'use strict';

  // ── DOM References ──────────────────────────────────────────
  const uploadZone       = document.getElementById('upload-zone');
  const fileInput        = document.getElementById('file-input');
  const fileBadge        = document.getElementById('file-badge');
  const fileName         = document.getElementById('file-name');
  const removeFileBtn    = document.getElementById('remove-file');
  const jobDescInput     = document.getElementById('job-description');
  const jobDescError     = document.getElementById('job-desc-error');
  const generateBtn      = document.getElementById('generate-btn');
  const generateBtnText  = document.getElementById('generate-btn-text');
  const inputSection     = document.getElementById('input-section');
  const loaderSection    = document.getElementById('loader-section');
  const resultsSection   = document.getElementById('results-section');
  const scoreNumber      = document.getElementById('score-number');
  const scoreRingProgress= document.getElementById('score-ring-progress');
  const matchedSkillsBox = document.getElementById('matched-skills');
  const missingSkillsBox = document.getElementById('missing-skills');
  const studyPlanBox     = document.getElementById('study-plan');
  const startOverBtn     = document.getElementById('start-over-btn');

  // ── State ───────────────────────────────────────────────────
  let selectedFile = null;

  // ── Mock Data Generator ─────────────────────────────────────
  function generateMockResponse(jobDescription) {
    // Deterministic-ish mock based on input length for variety
    const baseScore = 65 + (jobDescription.length % 30);
    const score = Math.min(baseScore, 95);

    const allMatchedSkills = [
      'JavaScript', 'React', 'Node.js', 'SQL', 'REST APIs',
      'Python', 'Git', 'HTML/CSS', 'Problem Solving', 'Communication'
    ];
    const allMissingSkills = [
      'TypeScript', 'Docker', 'System Design', 'Kubernetes',
      'GraphQL', 'CI/CD', 'AWS', 'Data Structures'
    ];

    // Pick a subset based on input
    const seed = jobDescription.length;
    const matchedCount = 4 + (seed % 4);
    const missingCount = 2 + (seed % 3);

    const matchedSkills = allMatchedSkills.slice(0, matchedCount);
    const missingSkills = allMissingSkills.slice(0, missingCount);

    return {
      score: score,
      matchedSkills: matchedSkills,
      missingSkills: missingSkills,
      studyPlan: [
        {
          step: 1,
          title: 'Master Core CS Fundamentals',
          duration: 'Week 1–2',
          details: 'Focus on data structures (arrays, trees, graphs, hash maps) and algorithms (sorting, searching, dynamic programming). Solve 50+ problems on LeetCode targeting medium difficulty.'
        },
        {
          step: 2,
          title: 'Build Portfolio Projects',
          duration: 'Week 3',
          details: 'Create 2 full-stack projects demonstrating the missing skills identified above. Deploy them on GitHub with clear README documentation and live demos.'
        },
        {
          step: 3,
          title: 'Interview Preparation & Networking',
          duration: 'Week 4',
          details: 'Practice mock interviews on Pramp or Interviewing.io. Research target companies, prepare STAR-method behavioral answers, and optimize your LinkedIn profile.'
        }
      ]
    };
  }

  // ── Render Functions ────────────────────────────────────────
  function renderScore(score) {
    // Animate the score number
    let current = 0;
    const duration = 1500;
    const start = performance.now();

    function animate(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      current = Math.round(eased * score);
      scoreNumber.textContent = current + '%';

      // Animate the SVG ring
      const circumference = 440;
      const offset = circumference - (circumference * eased * score) / 100;
      scoreRingProgress.style.strokeDashoffset = offset;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }

  function renderSkillTags(container, skills, type) {
    container.innerHTML = '';
    skills.forEach(function (skill, i) {
      const tag = document.createElement('span');
      tag.className = 'skill-tag skill-tag--' + type;
      tag.style.animationDelay = (i * 80) + 'ms';
      tag.innerHTML =
        '<span class="skill-tag__dot"></span>' +
        skill;
      container.appendChild(tag);
    });
  }

  function renderStudyPlan(steps) {
    studyPlanBox.innerHTML = '';
    steps.forEach(function (step, i) {
      var card = document.createElement('div');
      card.className = 'step-card';
      card.style.animationDelay = (300 + i * 150) + 'ms';
      card.innerHTML =
        '<div class="step-card__number">' + step.step + '</div>' +
        '<div class="step-card__content">' +
          '<div class="step-card__duration">' + step.duration + '</div>' +
          '<h3 class="step-card__title">' + step.title + '</h3>' +
          '<p class="step-card__details">' + step.details + '</p>' +
        '</div>';
      studyPlanBox.appendChild(card);
    });
  }

  // ── Event: File Upload ──────────────────────────────────────
  uploadZone.addEventListener('dragover', function (e) {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
  });

  uploadZone.addEventListener('dragleave', function () {
    uploadZone.classList.remove('drag-over');
  });

  uploadZone.addEventListener('drop', function (e) {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', function () {
    if (fileInput.files.length > 0) {
      handleFileSelect(fileInput.files[0]);
    }
  });

  function handleFileSelect(file) {
    selectedFile = file;
    fileName.textContent = file.name;
    fileBadge.style.display = 'inline-flex';
  }

  removeFileBtn.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    selectedFile = null;
    fileInput.value = '';
    fileBadge.style.display = 'none';
  });

  // ── Event: Generate Roadmap ─────────────────────────────────
  generateBtn.addEventListener('click', function () {
    // Validate
    var jd = jobDescInput.value.trim();
    if (!jd) {
      jobDescError.classList.add('visible');
      jobDescInput.focus();
      return;
    }
    jobDescError.classList.remove('visible');

    // Show loader
    generateBtn.disabled = true;
    generateBtnText.textContent = 'Analyzing…';
    loaderSection.classList.add('visible');
    resultsSection.classList.remove('visible');

    // Simulate API delay
    setTimeout(function () {
      var data = generateMockResponse(jd);

      // Hide loader, show results
      loaderSection.classList.remove('visible');
      resultsSection.classList.add('visible');

      // Render
      renderScore(data.score);
      renderSkillTags(matchedSkillsBox, data.matchedSkills, 'matched');
      renderSkillTags(missingSkillsBox, data.missingSkills, 'missing');
      renderStudyPlan(data.studyPlan);

      // Scroll to results
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Reset button
      generateBtn.disabled = false;
      generateBtnText.textContent = 'Generate Roadmap';
    }, 1800);
  });

  // Hide error on typing
  jobDescInput.addEventListener('input', function () {
    if (jobDescInput.value.trim()) {
      jobDescError.classList.remove('visible');
    }
  });

  // ── Event: Start Over ───────────────────────────────────────
  startOverBtn.addEventListener('click', function () {
    // Reset all state
    selectedFile = null;
    fileInput.value = '';
    fileBadge.style.display = 'none';
    jobDescInput.value = '';
    jobDescError.classList.remove('visible');
    resultsSection.classList.remove('visible');
    loaderSection.classList.remove('visible');

    // Reset score ring
    scoreRingProgress.style.strokeDashoffset = 440;
    scoreNumber.textContent = '0%';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

})();
