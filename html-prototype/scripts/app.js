// View Management
function showView(view) {
    // Hide all sections
    const sections = ['landing', 'dashboard', 'profile', 'assessment', 'results', 'chat'];
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
            element.classList.remove('active');
        }
    });

    // Show selected section
    const targetSection = document.getElementById(view);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Special handling for chat
    if (view === 'chat') {
        scrollChatToBottom();
    }
}

// Job Assessment Functions
function parseJobUrl() {
    const urlInput = document.getElementById('jobUrl');
    const url = urlInput.value.trim();

    if (!url) {
        alert('Please enter a job listing URL');
        return;
    }

    // Validate URL format
    try {
        new URL(url);
    } catch (e) {
        alert('Please enter a valid URL');
        return;
    }

    // Show loading state
    showParsingLoader();

    // Simulate API call to parse job listing (in production, this would be a backend call)
    setTimeout(() => {
        const extractedData = simulateJobParsing(url);
        populateJobForm(extractedData);
        hideParsingLoader();

        // Scroll to form
        document.getElementById('jobDetailsForm').scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }, 2000);
}

function simulateJobParsing(url) {
    // In production, this would:
    // 1. Send URL to backend
    // 2. Backend scrapes/parses the job page (or uses API)
    // 3. Returns structured data
    // 4. Could use Claude AI to extract structured data from HTML

    // Mock data based on URL pattern
    if (url.includes('indeed') || url.includes('linkedin') || url.includes('clearancejobs')) {
        return {
            company: 'Booz Allen Hamilton',
            role: 'Cybersecurity Analyst',
            salary: '$85,000 - $105,000',
            location: 'McLean, VA',
            clearance: 'ts-sci',
            benefits: 'full',
            extracted: true
        };
    }

    return {
        company: '',
        role: '',
        salary: '',
        location: '',
        clearance: '',
        benefits: '',
        extracted: false
    };
}

function populateJobForm(data) {
    document.getElementById('companyName').value = data.company || '';
    document.getElementById('role').value = data.role || '';
    document.getElementById('salary').value = data.salary || '';
    document.getElementById('location').value = data.location || '';
    document.getElementById('clearance').value = data.clearance || '';
    document.getElementById('benefits').value = data.benefits || '';

    // Add visual feedback that data was extracted
    if (data.extracted) {
        highlightExtractedFields();
    }
}

function highlightExtractedFields() {
    const inputs = ['companyName', 'role', 'salary', 'location', 'clearance', 'benefits'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input && input.value) {
            input.style.borderColor = 'var(--tactical-green)';
            setTimeout(() => {
                input.style.borderColor = '';
            }, 2000);
        }
    });
}

function showParsingLoader() {
    document.getElementById('jobDetailsForm').style.display = 'none';
    document.getElementById('parsingLoader').style.display = 'block';
}

function hideParsingLoader() {
    document.getElementById('parsingLoader').style.display = 'none';
    document.getElementById('jobDetailsForm').style.display = 'block';
}

function runAssessment() {
    const company = document.getElementById('companyName').value.trim();
    const role = document.getElementById('role').value.trim();

    if (!company || !role) {
        alert('Please fill in at least Company Name and Role');
        return;
    }

    // Check if resume is uploaded
    const hasResume = sessionStorage.getItem('resumeUploaded') === 'true';

    // Show/hide fit score section based on resume upload
    const fitScoreSection = document.getElementById('fitScoreSection');
    if (fitScoreSection) {
        fitScoreSection.style.display = hasResume ? 'block' : 'none';
    }

    // In production, this would send data to backend for analysis
    // Backend would compare resume data to job requirements if resume exists
    // For now, just show the results page
    showView('results');
}

function toggleExamples() {
    const exampleUrls = document.getElementById('exampleUrls');
    const icon = document.getElementById('exampleToggleIcon');

    if (exampleUrls.style.display === 'none') {
        exampleUrls.style.display = 'block';
        icon.classList.add('open');
    } else {
        exampleUrls.style.display = 'none';
        icon.classList.remove('open');
    }
}

// Chat Functions
function scrollChatToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 100);
    }
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (message) {
        addUserMessage(message);
        input.value = '';

        // Auto-resize textarea
        input.style.height = 'auto';

        // Simulate AI response after a delay
        setTimeout(() => {
            addAIResponse(message);
        }, 1500);
    }
}

function addUserMessage(text) {
    const chatMessages = document.getElementById('chatMessages');
    const messageTime = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
    });

    const messageHTML = `
        <div class="chat-message user-message fade-in">
            <div class="message-avatar user-avatar">M</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-author">You</span>
                    <span class="message-time">${messageTime}</span>
                </div>
                <div class="message-text">
                    <p>${escapeHtml(text)}</p>
                </div>
            </div>
        </div>
    `;

    chatMessages.insertAdjacentHTML('beforeend', messageHTML);
    scrollChatToBottom();
}

function addAIResponse(userMessage) {
    const chatMessages = document.getElementById('chatMessages');
    const messageTime = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
    });

    // Generate context-aware response based on user message
    let responseText = generateAIResponse(userMessage);

    const messageHTML = `
        <div class="chat-message ai-message fade-in">
            <div class="message-avatar ai-avatar">AI</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-author">Transition Advisor</span>
                    <span class="message-time">${messageTime}</span>
                </div>
                <div class="message-text">
                    ${responseText}
                </div>
                <div class="message-actions">
                    <button class="message-action-btn">💾 Save Advice</button>
                    <button class="message-action-btn">🔗 Share</button>
                </div>
            </div>
        </div>
    `;

    chatMessages.insertAdjacentHTML('beforeend', messageHTML);
    scrollChatToBottom();
}

function generateAIResponse(userMessage) {
    const msg = userMessage.toLowerCase();

    // Keyword-based responses
    if (msg.includes('salary') || msg.includes('negotiate')) {
        return `
            <p><strong>Salary Negotiation Strategy for Veterans:</strong></p>

            <div class="insight-box success">
                <div class="insight-header">✓ Your Advantages</div>
                <ul>
                    <li><strong>Active clearance:</strong> Worth 15-20% salary premium in DMV area</li>
                    <li><strong>Military experience:</strong> Discipline, leadership, security mindset</li>
                    <li><strong>Timeline leverage:</strong> 120 days gives you time to negotiate properly</li>
                </ul>
            </div>

            <div class="insight-box">
                <div class="insight-header">🎯 Negotiation Framework</div>
                <p><strong>1. Research Market Rate:</strong> For 25B → Cybersecurity roles in Alexandria</p>
                <p><strong>2. Typical Range:</strong> $75k-$110k depending on certs and experience</p>
                <p><strong>3. Your Ask:</strong> Aim for top of band if you have Security+</p>
                <p><strong>4. Leverage Multiple Offers:</strong> Use competing offers for negotiation power</p>
            </div>

            <p>Based on your profile, I'd recommend targeting <strong>$85k-$95k</strong> as a starting point for cybersecurity analyst roles. Would you like help evaluating a specific offer?</p>
        `;
    } else if (msg.includes('resume')) {
        return `
            <p><strong>Military → Civilian Resume Strategy:</strong></p>

            <div class="insight-box warning">
                <div class="insight-header">⚠️ Common Mistakes to Avoid</div>
                <ul>
                    <li>Using military jargon civilians don't understand</li>
                    <li>Focusing on duties instead of accomplishments</li>
                    <li>Not quantifying your impact (use numbers!)</li>
                    <li>Forgetting to highlight clearance status prominently</li>
                </ul>
            </div>

            <div class="insight-box success">
                <div class="insight-header">✓ Winning Formula for 25B</div>
                <p><strong>Top of resume:</strong> "TS/SCI Cleared Cybersecurity Professional | Security+ Certified"</p>
                <p><strong>Use civilian terms:</strong> "Managed network security" not "Conducted COMSEC operations"</p>
                <p><strong>Quantify everything:</strong> "Secured networks supporting 500+ users" vs "Performed security tasks"</p>
            </div>

            <p>Want me to review your resume bullet points and translate them to civilian language?</p>
        `;
    } else if (msg.includes('cert') || msg.includes('security+') || msg.includes('cissp')) {
        return `
            <p><strong>Certification Priority for Your Timeline:</strong></p>

            <div class="insight-box success">
                <div class="insight-header">🎯 Immediate: Security+ (Next 30 days)</div>
                <ul>
                    <li><strong>Why:</strong> DoD 8570 baseline requirement for most contractor jobs</li>
                    <li><strong>Study time:</strong> 2-4 weeks with focused prep</li>
                    <li><strong>Cost:</strong> ~$400 exam fee</li>
                    <li><strong>ROI:</strong> Opens 80% of entry-level cleared cyber jobs</li>
                </ul>
            </div>

            <div class="insight-box">
                <div class="insight-header">💡 Year 1 Civilian: Build Specialization</div>
                <p>After Security+, consider one of these based on your career path:</p>
                <ul>
                    <li><strong>CySA+:</strong> If you want defensive/SOC analyst roles</li>
                    <li><strong>CEH:</strong> If you want pentesting/offensive security</li>
                    <li><strong>Cloud certs (AWS/Azure):</strong> If you want cloud security</li>
                </ul>
            </div>

            <div class="insight-box warning">
                <div class="insight-header">⏳ Later: CISSP (Years 2-3)</div>
                <p>CISSP requires 5 years experience. Focus on getting experience first, then pursue it when you qualify. It's valuable for senior roles, but not urgent now.</p>
            </div>

            <p>Your 120-day timeline is perfect for Security+. Start now!</p>
        `;
    } else if (msg.includes('company') || msg.includes('companies') || msg.includes('25b')) {
        return `
            <p><strong>Top Companies for 25B Cyber Professionals in DMV:</strong></p>

            <div class="insight-box success">
                <div class="insight-header">🏆 Tier 1: Prime Contractors (Most Stable)</div>
                <ul>
                    <li><strong>Booz Allen Hamilton:</strong> Large cyber practice, good training</li>
                    <li><strong>Northrop Grumman:</strong> Defense-focused, stable</li>
                    <li><strong>Leidos:</strong> Huge federal IT presence</li>
                    <li><strong>SAIC:</strong> Strong cyber division</li>
                </ul>
            </div>

            <div class="insight-box">
                <div class="insight-header">💡 Tier 2: Growing Mid-Size (Higher Growth)</div>
                <ul>
                    <li><strong>CACI:</strong> Aggressive hiring, good advancement</li>
                    <li><strong>ManTech:</strong> Cyber-focused, competitive pay</li>
                    <li><strong>Peraton:</strong> Newer but growing fast</li>
                </ul>
            </div>

            <div class="insight-box warning">
                <div class="insight-header">⚠️ Tier 3: High Risk, High Reward</div>
                <p><strong>Smaller contractors:</strong> Higher pay potential, less stability. Better suited for Year 2+ when you have runway built up.</p>
            </div>

            <p>With your 2.7-month runway, I'd recommend focusing on <strong>Tier 1 companies</strong> for your first job. Build stability, then explore higher-paying options once you have 6+ months savings.</p>
        `;
    } else if (msg.includes('offer')) {
        return `
            <p><strong>Evaluating Job Offers - Beyond Just Salary:</strong></p>

            <div class="insight-box">
                <div class="insight-header">📊 Use the Assessment Tool</div>
                <p>I recommend running a full assessment on any offer you receive. Click the <strong>"Assess Job Security"</strong> button on your dashboard.</p>
                <p>This will analyze:</p>
                <ul>
                    <li>Company stability score</li>
                    <li>Financial runway projection</li>
                    <li>Layoff risk factors</li>
                    <li>Industry trends</li>
                </ul>
            </div>

            <div class="insight-box success">
                <div class="insight-header">✓ Key Factors to Consider</div>
                <ul>
                    <li><strong>Stability score:</strong> Aim for 7.5+ for first civilian job</li>
                    <li><strong>Runway impact:</strong> How long until you have 6+ months saved?</li>
                    <li><strong>Contract type:</strong> Prime contractor > subcontractor for stability</li>
                    <li><strong>Career growth:</strong> Training budget? Cert reimbursement?</li>
                </ul>
            </div>

            <p>Do you have a specific offer you'd like me to help you evaluate?</p>
        `;
    } else {
        // Generic helpful response
        return `
            <p>I can help you with that! Based on your profile:</p>

            <div class="insight-box">
                <div class="insight-header">📋 Your Transition Status</div>
                <ul>
                    <li><strong>MOS:</strong> 25B (IT Specialist)</li>
                    <li><strong>ETS:</strong> 120 days out</li>
                    <li><strong>Location:</strong> Alexandria, VA area</li>
                    <li><strong>Current Runway:</strong> 2.7 months</li>
                </ul>
            </div>

            <p>I can assist with:</p>
            <ul>
                <li><strong>Career strategy:</strong> Best companies, roles, career paths</li>
                <li><strong>Certifications:</strong> What to get and when</li>
                <li><strong>Resume/Interview:</strong> Translating military experience</li>
                <li><strong>Offer evaluation:</strong> Assessing job security and comp</li>
                <li><strong>Financial planning:</strong> Building your runway</li>
            </ul>

            <p>What specific aspect would you like to dive into?</p>
        `;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Resume Upload Functions
function handleResumeUpload(file) {
    // Validate file
    if (!file) return;

    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
        alert('Please upload a PDF or DOCX file');
        return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
    }

    // Show parsing status
    showResumeParsingStatus();

    // Simulate resume parsing (in production, send to backend)
    setTimeout(() => {
        const resumeData = {
            fileName: file.name,
            fileSize: formatFileSize(file.size),
            uploadDate: new Date().toLocaleDateString(),
            skills: [
                'Network Security',
                'Cybersecurity',
                'Linux/Windows',
                'SIEM Tools',
                'Incident Response',
                'Vulnerability Assessment',
                'Firewall Configuration',
                'Security Compliance'
            ],
            certifications: [
                { name: 'Security+', issuer: 'CompTIA' },
                { name: 'CCNA', issuer: 'Cisco' }
            ],
            experience: '6 years',
            education: "Bachelor's in Computer Science"
        };

        displayResumeData(resumeData);
    }, 3000);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function showResumeParsingStatus() {
    document.getElementById('resumeUploadArea').style.display = 'none';
    document.getElementById('resumeDisplay').style.display = 'none';
    document.getElementById('resumeParsingStatus').style.display = 'flex';
}

function displayResumeData(data) {
    // Hide parsing status
    document.getElementById('resumeParsingStatus').style.display = 'none';

    // Update file info
    document.getElementById('resumeFileName').textContent = data.fileName;
    document.getElementById('resumeFileSize').textContent = data.fileSize;
    document.getElementById('resumeUploadDate').textContent = `Uploaded ${data.uploadDate}`;

    // Show resume display
    document.getElementById('resumeDisplay').style.display = 'block';
    document.getElementById('resumeStatusBadge').style.display = 'flex';

    // Store in sessionStorage for demo purposes
    sessionStorage.setItem('resumeUploaded', 'true');
    sessionStorage.setItem('resumeData', JSON.stringify(data));
}

function removeResume() {
    if (confirm('Are you sure you want to remove your resume?')) {
        document.getElementById('resumeDisplay').style.display = 'none';
        document.getElementById('resumeUploadArea').style.display = 'block';
        document.getElementById('resumeStatusBadge').style.display = 'none';
        document.getElementById('resumeFileInput').value = '';

        // Clear from storage
        sessionStorage.removeItem('resumeUploaded');
        sessionStorage.removeItem('resumeData');
    }
}

// Auto-resize textarea
document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });

        // Send message on Enter (but Shift+Enter for new line)
        chatInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // Resume file input handler
    const resumeFileInput = document.getElementById('resumeFileInput');
    if (resumeFileInput) {
        resumeFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                handleResumeUpload(file);
            }
        });
    }

    // Resume dropzone handlers
    const dropzone = document.getElementById('uploadDropzone');
    if (dropzone) {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Highlight drop area when dragging over
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => {
                dropzone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => {
                dropzone.classList.remove('dragover');
            }, false);
        });

        // Handle dropped files
        dropzone.addEventListener('drop', function(e) {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleResumeUpload(files[0]);
            }
        }, false);

        // Handle click to upload
        dropzone.addEventListener('click', function() {
            document.getElementById('resumeFileInput').click();
        });
    }

    // Check if resume was previously uploaded (session persistence)
    if (sessionStorage.getItem('resumeUploaded') === 'true') {
        const resumeData = JSON.parse(sessionStorage.getItem('resumeData'));
        if (resumeData) {
            document.getElementById('resumeUploadArea').style.display = 'none';
            displayResumeData(resumeData);
        }
    }

    // Show landing page by default
    showView('landing');
});
