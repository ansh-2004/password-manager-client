const API = 'https://password-manager-server-v5al.onrender.com';

document.getElementById('credentialForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const website = document.getElementById('website').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const passwordStrength = document.getElementById('strengthText-add').innerText;
  if (!website || !username || !password) {
    alert("Please fill out all fields.");
    return;
  }
  
  if (passwordStrength !== 'Strong') {
    alert("Password must be strong to save credentials.");
    return;
  }

  const res = await fetch(`${API}/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ website, username, password })
  });

  if (res.ok) {
    alert('Credential added!');
    document.getElementById('credentialForm').reset();
    loadCredentials();
  }
});

async function loadCredentials() {
  const res = await fetch(`${API}/get`);
  const data = await res.json();

  const tbody = document.getElementById('credentialsBody');
  tbody.innerHTML = '';

  data.forEach((item) => {
    const row = document.createElement('tr');
    row.id = `row-${item._id}`;
    row.innerHTML = `
       <td data-label="Website">${item.website}</td>
  <td data-label="Username">${item.username}</td>
  <td data-label="Password">
    <span id="pw-${item._id}">********</span>
    <button onclick="togglePassword('${item._id}', '${item.password}')">👁</button>
    <button onclick="copyPassword('${item.password}')">📋</button>
  </td>
  <td data-label="Actions">
    <button onclick="editCredential('${item._id}', '${item.website}', '${item.username}', '${item.password}')">✏️</button>
    <button onclick="deleteCredential('${item._id}')">🗑</button>
  </td>
    `;

    tbody.appendChild(row);
  });
}

function togglePassword(id, actualPassword) {
  const span = document.getElementById(`pw-${id}`);
  span.textContent = span.textContent === '********' ? actualPassword : '********';
}

function copyPassword(password) {
  navigator.clipboard.writeText(password).then(() => {
    alert('Password copied to clipboard!');
  });
}

async function deleteCredential(id) {
  const res = await fetch(`${API}/delete/${id}`, {
    method: 'DELETE'
  });

  if (res.ok) {
    alert('Deleted!');
    loadCredentials();
  }
}

function filterCredentials() {
  const input = document.getElementById('searchInput').value.toLowerCase();
  const rows = document.querySelectorAll('#credentialsBody tr');

  rows.forEach(row => {
    const site = row.cells[0].textContent.toLowerCase();
    row.style.display = site.includes(input) ? '' : 'none';
  });
}
function editCredential(id, website, username, password) {

    const row = document.getElementById(`row-${id}`);
    row.innerHTML = `
      <td><input type="text" id="edit-website-${id}" value="${website}"></td>
      <td><input type="text" id="edit-username-${id}" value="${username}"></td>
     <td>
      <input type="text" id="edit-password-${id}" value="${password}" 
             oninput="checkPasswordStrength(this.value, '${id}')">
      <div id="strengthText-${id}" style="font-weight:bold; margin-top:4px;"></div>
      <div id="strengthBar-${id}" style="height: 5px; background-color: lightgray; 
           border-radius: 4px; margin-top: 2px;"></div>
    </td>
      <td>
        <button onclick="saveEdit('${id}')">💾 Save</button>
        <button onclick="loadCredentials()">❌ Cancel</button>
      </td>
    `;
  }

  async function saveEdit(id) {
    const website = document.getElementById(`edit-website-${id}`).value;
    const username = document.getElementById(`edit-username-${id}`).value;
    const password = document.getElementById(`edit-password-${id}`).value;
  
    const response = await fetch(`${API}/update/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ website, username, password })
    });
  
    const data = await response.json();
    alert(data.message);
    loadCredentials();
  }

  function checkPasswordStrength(password, id = '') {
    const strengthText = document.getElementById(`strengthText-${id}`);
  const strengthBar = document.getElementById(`strengthBar-${id}`);
  
    let strength = 0;
  
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
  
    if (password.length >= 8) strength++;
    if (hasUpper) strength++;
    if (hasLower) strength++;
    if (hasNumber) strength++;
    if (hasSymbol) strength++;
  
    if (password.length < 8) {
      strengthText.textContent = "Weak";
      strengthText.style.color = "red";
      strengthBar.style.backgroundColor = "red";
      strengthBar.style.width = "30%";
    } else if (strength >= 3 && password.length >= 8) {
      strengthText.textContent = "Medium";
      strengthText.style.color = "orange";
      strengthBar.style.backgroundColor = "orange";
      strengthBar.style.width = "60%";
    } 
    if (strength >= 4 && password.length >= 12) {
      strengthText.textContent = "Strong";
      strengthText.style.color = "green";
      strengthBar.style.backgroundColor = "green";
      strengthBar.style.width = "100%";
    }
  }
  
  
  function generatePassword(length = 12) {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+{}[]<>?";
  
    const allChars = upper + lower + numbers + symbols;
  
   
    let password = 
      upper[Math.floor(Math.random() * upper.length)] +
      lower[Math.floor(Math.random() * lower.length)] +
      numbers[Math.floor(Math.random() * numbers.length)] +
      symbols[Math.floor(Math.random() * symbols.length)];
  
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
  
    
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    
    const passwordInput = document.getElementById('password');
    passwordInput.value = password;
    checkPasswordStrength(password, 'add');
  }
  
  function exportAsCSV() {
    fetch(`${API}/get`)
      .then(res => res.json())
      .then(data => {
        const header = ['Website', 'Username', 'Password'];
        const rows = data.map(item => [item.website, item.username, item.password]);
  
        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += header.join(',') + '\n';
        rows.forEach(row => {
          csvContent += row.join(',') + '\n';
        });
  
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'credentials.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  }
  
  function exportAsJSON() {
    fetch(`${API}/get`)
      .then(res => res.json())
      .then(data => {
        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
  
        const link = document.createElement('a');
        link.href = url;
        link.download = 'credentials.json';
        link.click();
        URL.revokeObjectURL(url);
      });
  }

  const toggleBtn = document.getElementById('darkModeToggle');

toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');

  
  if (document.body.classList.contains('dark-mode')) {
    toggleBtn.innerText = '☀️ Light Mode';
  } else {
    toggleBtn.innerText = '🌙 Dark Mode';
  }

  
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});


window.addEventListener('DOMContentLoaded', () => {
  const isDarkMode = JSON.parse(localStorage.getItem('darkMode'));
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    toggleBtn.innerText = '☀️ Light Mode';
  }
});

  

window.onload = loadCredentials;
