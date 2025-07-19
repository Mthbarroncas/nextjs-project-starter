// Resume Builder JavaScript
let resumeData = {
    personal: {},
    experience: [],
    education: [],
    skills: []
};

// Drag and Drop functionality
let draggedElement = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeDragAndDrop();
    loadFromLocalStorage();
    updatePreview();
});

function initializeDragAndDrop() {
    const sections = document.querySelectorAll('.section');
    
    sections.forEach(section => {
        section.addEventListener('dragstart', handleDragStart);
        section.addEventListener('dragover', handleDragOver);
        section.addEventListener('drop', handleDrop);
        section.addEventListener('dragend', handleDragEnd);
    });
}

function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
    e.preventDefault();
    if (this !== draggedElement) {
        const container = this.parentNode;
        const draggedIndex = Array.from(container.children).indexOf(draggedElement);
        const targetIndex = Array.from(container.children).indexOf(this);
        
        if (draggedIndex < targetIndex) {
            container.insertBefore(draggedElement, this.nextSibling);
        } else {
            container.insertBefore(draggedElement, this);
        }
    }
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedElement = null;
}

// Update preview in real-time
function updatePreview() {
    // Personal Information
    const fullName = document.getElementById('fullName').value || 'Your Name';
    const jobTitle = document.getElementById('jobTitle').value || 'Your Title';
    const email = document.getElementById('email').value || 'email@example.com';
    const phone = document.getElementById('phone').value || '+1 (555) 123-4567';
    const location = document.getElementById('location').value || 'Location';
    const summary = document.getElementById('summary').value || 'Your professional summary will appear here...';

    document.getElementById('previewName').textContent = fullName;
    document.getElementById('previewTitle').textContent = jobTitle;
    document.getElementById('previewEmail').textContent = email;
    document.getElementById('previewPhone').textContent = phone;
    document.getElementById('previewLocation').textContent = location;
    document.getElementById('previewSummary').textContent = summary;

    // Experience
    updateExperiencePreview();
    
    // Education
    updateEducationPreview();
    
    // Skills
    updateSkillsPreview();

    // Save to localStorage
    saveToLocalStorage();
}

function updateExperiencePreview() {
    const experienceItems = document.querySelectorAll('#experienceList .experience-item');
    const previewContainer = document.getElementById('previewExperience');
    previewContainer.innerHTML = '';

    experienceItems.forEach(item => {
        const title = item.querySelector('.exp-title').value;
        const company = item.querySelector('.exp-company').value;
        const date = item.querySelector('.exp-date').value;
        const description = item.querySelector('.exp-desc').value;

        if (title || company) {
            const expDiv = document.createElement('div');
            expDiv.className = 'experience-item';
            expDiv.innerHTML = `
                <div class="item-title">${title}</div>
                <div class="item-company">${company}</div>
                <div class="item-date">${date}</div>
                <div class="item-description">${description}</div>
            `;
            previewContainer.appendChild(expDiv);
        }
    });
}

function updateEducationPreview() {
    const educationItems = document.querySelectorAll('#educationList .education-item');
    const previewContainer = document.getElementById('previewEducation');
    previewContainer.innerHTML = '';

    educationItems.forEach(item => {
        const degree = item.querySelector('.edu-degree').value;
        const school = item.querySelector('.edu-school').value;
        const year = item.querySelector('.edu-year').value;

        if (degree || school) {
            const eduDiv = document.createElement('div');
            eduDiv.className = 'education-item';
            eduDiv.innerHTML = `
                <div class="item-title">${degree}</div>
                <div class="item-company">${school}</div>
                <div class="item-date">${year}</div>
            `;
            previewContainer.appendChild(eduDiv);
        }
    });
}

function updateSkillsPreview() {
    const skillsText = document.getElementById('skills').value;
    const previewContainer = document.getElementById('previewSkills');
    previewContainer.innerHTML = '';

    if (skillsText) {
        const skills = skillsText.split(',').map(skill => skill.trim()).filter(skill => skill);
        skills.forEach(skill => {
            const skillSpan = document.createElement('span');
            skillSpan.className = 'skill-tag';
            skillSpan.textContent = skill;
            previewContainer.appendChild(skillSpan);
        });
    }
}

// Add/Remove Experience
function addExperience() {
    const experienceList = document.getElementById('experienceList');
    const newExperience = document.createElement('div');
    newExperience.className = 'experience-item';
    newExperience.innerHTML = `
        <div class="form-group">
            <label>Job Title</label>
            <input type="text" class="exp-title" placeholder="Software Developer" oninput="updatePreview()">
        </div>
        <div class="form-group">
            <label>Company</label>
            <input type="text" class="exp-company" placeholder="Tech Company Inc." oninput="updatePreview()">
        </div>
        <div class="form-group">
            <label>Duration</label>
            <input type="text" class="exp-date" placeholder="Jan 2020 - Present" oninput="updatePreview()">
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea class="exp-desc" placeholder="Job responsibilities and achievements..." oninput="updatePreview()"></textarea>
        </div>
        <button class="remove-item" onclick="removeExperience(this)">Remove</button>
    `;
    experienceList.appendChild(newExperience);
}

function removeExperience(button) {
    button.parentElement.remove();
    updatePreview();
}

// Add/Remove Education
function addEducation() {
    const educationList = document.getElementById('educationList');
    const newEducation = document.createElement('div');
    newEducation.className = 'education-item';
    newEducation.innerHTML = `
        <div class="form-group">
            <label>Degree</label>
            <input type="text" class="edu-degree" placeholder="Bachelor of Computer Science" oninput="updatePreview()">
        </div>
        <div class="form-group">
            <label>Institution</label>
            <input type="text" class="edu-school" placeholder="University Name" oninput="updatePreview()">
        </div>
        <div class="form-group">
            <label>Year</label>
            <input type="text" class="edu-year" placeholder="2016 - 2020" oninput="updatePreview()">
        </div>
        <button class="remove-item" onclick="removeEducation(this)">Remove</button>
    `;
    educationList.appendChild(newEducation);
}

function removeEducation(button) {
    button.parentElement.remove();
    updatePreview();
}

// Local Storage functions
function saveToLocalStorage() {
    const data = {
        personal: {
            fullName: document.getElementById('fullName').value,
            jobTitle: document.getElementById('jobTitle').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            location: document.getElementById('location').value,
            summary: document.getElementById('summary').value
        },
        experience: Array.from(document.querySelectorAll('#experienceList .experience-item')).map(item => ({
            title: item.querySelector('.exp-title').value,
            company: item.querySelector('.exp-company').value,
            date: item.querySelector('.exp-date').value,
            description: item.querySelector('.exp-desc').value
        })),
        education: Array.from(document.querySelectorAll('#educationList .education-item')).map(item => ({
            degree: item.querySelector('.edu-degree').value,
            school: item.querySelector('.edu-school').value,
            year: item.querySelector('.edu-year').value
        })),
        skills: document.getElementById('skills').value
    };
    
    localStorage.setItem('resumeData', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem('resumeData');
    if (savedData) {
        const data = JSON.parse(savedData);
        
        // Load personal information
        if (data.personal) {
            document.getElementById('fullName').value = data.personal.fullName || '';
            document.getElementById('jobTitle').value = data.personal.jobTitle || '';
            document.getElementById('email').value = data.personal.email || '';
            document.getElementById('phone').value = data.personal.phone || '';
            document.getElementById('location').value = data.personal.location || '';
            document.getElementById('summary').value = data.personal.summary || '';
        }
        
        // Load skills
        if (data.skills) {
            document.getElementById('skills').value = data.skills;
        }
        
        // Load experience (skip first default item)
        if (data.experience && data.experience.length > 1) {
            for (let i = 1; i < data.experience.length; i++) {
                addExperience();
            }
        }
        
        // Load education (skip first default item)
        if (data.education && data.education.length > 1) {
            for (let i = 1; i < data.education.length; i++) {
                addEducation();
            }
        }
        
        // Fill in the data
        setTimeout(() => {
            if (data.experience) {
                const expItems = document.querySelectorAll('#experienceList .experience-item');
                data.experience.forEach((exp, index) => {
                    if (expItems[index]) {
                        expItems[index].querySelector('.exp-title').value = exp.title || '';
                        expItems[index].querySelector('.exp-company').value = exp.company || '';
                        expItems[index].querySelector('.exp-date').value = exp.date || '';
                        expItems[index].querySelector('.exp-desc').value = exp.description || '';
                    }
                });
            }
            
            if (data.education) {
                const eduItems = document.querySelectorAll('#educationList .education-item');
                data.education.forEach((edu, index) => {
                    if (eduItems[index]) {
                        eduItems[index].querySelector('.edu-degree').value = edu.degree || '';
                        eduItems[index].querySelector('.edu-school').value = edu.school || '';
                        eduItems[index].querySelector('.edu-year').value = edu.year || '';
                    }
                });
            }
            
            updatePreview();
        }, 100);
    }
}

// Save resume function
function saveResume() {
    saveToLocalStorage();
    
    // Create download link
    const resumeContent = document.getElementById('resumePreview').innerHTML;
    const fullHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Resume</title>
            <style>
                body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #2d3748; margin: 40px; }
                .resume-header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #667eea; }
                .resume-name { font-size: 2.5rem; font-weight: 700; color: #2d3748; margin-bottom: 10px; }
                .resume-title { font-size: 1.2rem; color: #667eea; margin-bottom: 15px; }
                .resume-contact { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; }
                .resume-section { margin-bottom: 25px; }
                .resume-section h3 { font-size: 1.3rem; font-weight: 600; color: #2d3748; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 2px solid #e2e8f0; }
                .experience-item, .education-item { margin-bottom: 20px; padding-left: 20px; border-left: 3px solid #667eea; }
                .item-title { font-weight: 600; color: #2d3748; }
                .item-company { color: #667eea; font-weight: 500; }
                .item-date { color: #718096; font-size: 0.9rem; }
                .skills-list { display: flex; flex-wrap: wrap; gap: 10px; }
                .skill-tag { background: #667eea; color: white; padding: 5px 12px; border-radius: 20px; font-size: 0.9rem; }
            </style>
        </head>
        <body>${resumeContent}</body>
        </html>
    `;
    
    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.html';
    a.click();
    URL.revokeObjectURL(url);
    
    alert('✅ Resume saved successfully!');
}

// Export to PDF function
function exportToPDF() {
    // Simple PDF export using print functionality
    const printWindow = window.open('', '_blank');
    const resumeContent = document.getElementById('resumePreview').innerHTML;
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Resume PDF</title>
            <style>
                @media print {
                    body { margin: 0; }
                    @page { margin: 1in; }
                }
                body { 
                    font-family: 'Inter', Arial, sans-serif; 
                    line-height: 1.6; 
                    color: #2d3748; 
                    margin: 0;
                    padding: 20px;
                }
                .resume-header { 
                    text-align: center; 
                    margin-bottom: 30px; 
                    padding-bottom: 20px; 
                    border-bottom: 3px solid #667eea; 
                }
                .resume-name { 
                    font-size: 2.5rem; 
                    font-weight: 700; 
                    color: #2d3748; 
                    margin-bottom: 10px; 
                }
                .resume-title { 
                    font-size: 1.2rem; 
                    color: #667eea; 
                    margin-bottom: 15px; 
                }
                .resume-contact { 
                    display: flex; 
                    justify-content: center; 
                    gap: 20px; 
                    flex-wrap: wrap; 
                }
                .resume-section { 
                    margin-bottom: 25px; 
                    page-break-inside: avoid;
                }
                .resume-section h3 { 
                    font-size: 1.3rem; 
                    font-weight: 600; 
                    color: #2d3748; 
                    margin-bottom: 15px; 
                    padding-bottom: 5px; 
                    border-bottom: 2px solid #e2e8f0; 
                }
                .experience-item, .education-item { 
                    margin-bottom: 20px; 
                    padding-left: 20px; 
                    border-left: 3px solid #667eea;
                    page-break-inside: avoid;
                }
                .item-title { 
                    font-weight: 600; 
                    color: #2d3748; 
                }
                .item-company { 
                    color: #667eea; 
                    font-weight: 500; 
                }
                .item-date { 
                    color: #718096; 
                    font-size: 0.9rem; 
                }
                .skills-list { 
                    display: flex; 
                    flex-wrap: wrap; 
                    gap: 10px; 
                }
                .skill-tag { 
                    background: #667eea; 
                    color: white; 
                    padding: 5px 12px; 
                    border-radius: 20px; 
                    font-size: 0.9rem;
                    print-color-adjust: exact;
                    -webkit-print-color-adjust: exact;
                }
            </style>
        </head>
        <body>
            ${resumeContent}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
    
    alert('📄 PDF export initiated! Use your browser\'s print dialog to save as PDF.');
}
