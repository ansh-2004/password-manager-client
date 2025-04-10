const API = 'http://localhost:5000';

document.getElementById('credentialForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const website = document.getElementById('website').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

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
      <td>${item.website}</td>
      <td>${item.username}</td>
      <td>
        <span id="pw-${item._id}">********</span>
        <button onclick="togglePassword('${item._id}', '${item.password}')">👁</button>
        <button onclick="copyPassword('${item.password}')">📋</button>
      </td>
      <td>
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
      <td><input type="text" id="edit-password-${id}" value="${password}"></td>
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
  
  
function generatePassword() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let length = 12;
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  document.getElementById('password').value = password;
}

window.onload = loadCredentials;
