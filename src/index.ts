// Define types
interface Member {
  name: string;
  id: number;
}

interface Group {
  name: string;
  members: Member[];
}

// Declare XLSX variable from the external library
declare const XLSX: any;

// DOM Elements
const numGroupsInput = document.getElementById('numGroups') as HTMLInputElement;
const memberListTextarea = document.getElementById('memberList') as HTMLTextAreaElement;
const equalDistributionCheckbox = document.getElementById('equalDistribution') as HTMLInputElement;
const generateGroupsButton = document.getElementById('generateGroups') as HTMLButtonElement;
const clearAllButton = document.getElementById('clearAll') as HTMLButtonElement;
const resultsSection = document.getElementById('resultsSection') as HTMLElement;
const groupResults = document.getElementById('groupResults') as HTMLElement;
const summaryStats = document.getElementById('summaryStats') as HTMLElement;
const downloadButton = document.getElementById('downloadResults') as HTMLButtonElement;
const excelFileInput = document.getElementById('excelFileInput') as HTMLInputElement;
const fileNameDisplay = document.getElementById('fileName') as HTMLElement;

// Modal Elements
const donateBtn = document.getElementById('donateBtn') as HTMLButtonElement;
const donateModal = document.getElementById('donateModal') as HTMLElement;
const closeButtons = document.querySelectorAll('.close-button');
const copyGcashBtn = document.getElementById('copyGcash') as HTMLButtonElement;
const gcashAccount = document.getElementById('gcashAccount') as HTMLElement;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  generateGroupsButton.addEventListener('click', generateGroups);
  clearAllButton.addEventListener('click', clearAll);
  downloadButton.addEventListener('click', downloadResults);
  excelFileInput.addEventListener('change', handleExcelImport);

  // Input validation handlers
  numGroupsInput.addEventListener('input', validateInputs);
  memberListTextarea.addEventListener('input', validateInputs);

  // Modal handlers
  donateBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Donate button clicked');
    openModal(donateModal);
  });
  
  // Close modal handlers
  closeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Find the parent modal
      const modal = button.closest('.modal') as HTMLElement;
      if (modal) {
        closeModal(modal);
      } else {
        closeAllModals();
      }
    });
  });
  
  // Close modal when clicking outside
  donateModal.addEventListener('click', function(e) {
    if (e.target === this) {
      closeModal(donateModal);
    }
  });
  
  // Copy GCash account
  if (copyGcashBtn) {
    copyGcashBtn.addEventListener('click', copyGcashDetails);
  }
  
  // Set GCash Account
  if (gcashAccount) {
    gcashAccount.textContent = "09706436276 (JE****O G.)";
  }

  // Check for saved data in session storage
  loadFromSessionStorage();
  
  // Load GCash QR code
  loadGcashQR();
});

// Modal Functions
function openModal(modal: HTMLElement): void {
  if (!modal) {
    console.error('Attempted to open a null modal');
    return;
  }
  
  console.log('Opening modal:', modal.id);
  
  // First, close any open modals
  closeAllModals();
  
  // Add a flag to track that we're in the process of opening a modal
  // to avoid race conditions with click handlers
  const openingFlag = Date.now();
  modal.dataset.openingTimestamp = openingFlag.toString();
  
  // Block other modal interactions during transition
  document.body.classList.add('modal-open');
  
  // Make the modal visible first
  modal.style.display = 'block';
  
  // Give the browser time to register the display change
  window.setTimeout(() => {
    // Only continue if this is still the most recent open request
    if (modal.dataset.openingTimestamp === openingFlag.toString()) {
      modal.classList.add('show');
      console.log('Modal shown:', modal.id);
    }
  }, 50);
}

function closeModal(modal: HTMLElement): void {
  if (!modal) return;
  
  console.log('Closing modal:', modal.id);
  modal.classList.remove('show');
  
  // Remove the opening timestamp
  delete modal.dataset.openingTimestamp;
  
  // Wait for the transition to complete before hiding
  window.setTimeout(() => {
    if (!modal.classList.contains('show')) {
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
      console.log('Modal hidden:', modal.id);
    }
  }, 300);
}

function closeAllModals(): void {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    const modalElement = modal as HTMLElement;
    // Delete any opening timestamps
    delete modalElement.dataset.openingTimestamp;
    
    modalElement.classList.remove('show');
    setTimeout(() => {
      if (!modalElement.classList.contains('show')) {
        modalElement.style.display = 'none';
      }
    }, 300);
  });
  
  document.body.classList.remove('modal-open');
}

// Load GCash QR code
function loadGcashQR(): void {
  // Try to load the QR code image
  const qrImage = document.querySelector('.donate-qr') as HTMLImageElement;
  if (qrImage) {
    console.log('Found QR image element, attempting to load image');
    
    // Set the onerror handler before setting the src
    qrImage.onerror = function() {
      console.error('Failed to load QR code image. Creating placeholder instead.');
      // If image fails to load, show a text placeholder
      qrImage.style.display = 'none';
      const container = document.querySelector('.donate-qr-container') as HTMLElement;
      if (container) {
        if (!container.querySelector('.qr-placeholder')) {
          const placeholder = document.createElement('div');
          placeholder.className = 'qr-placeholder';
          placeholder.innerHTML = '<i class="fas fa-qrcode"></i><p>GCash QR Code</p>';
          placeholder.style.cursor = 'pointer';
          
          // Add click handler to the placeholder to try loading the image again
          placeholder.addEventListener('click', function() {
            showQRCodeFullScreen();
          });
          
          container.insertBefore(placeholder, container.firstChild);
        }
      }
    };
    
    // Make QR code clickable to show in full size
    qrImage.style.cursor = 'pointer';
    qrImage.addEventListener('click', function() {
      showQRCodeFullScreen();
    });
    
    qrImage.onload = function() {
      console.log('QR code image loaded successfully:', qrImage.src);
      // Make sure the image is visible
      qrImage.style.display = 'block';
      // Remove any placeholders if they exist
      const placeholder = document.querySelector('.qr-placeholder');
      if (placeholder) {
        placeholder.remove();
      }
    };
    
    // Force reload by adding a timestamp
    const timestamp = new Date().getTime();
    qrImage.src = `./src/assets/gcash-qr.jpg?t=${timestamp}`;
    console.log('Set QR image source to:', qrImage.src);
  } else {
    console.error('Could not find QR image element with class "donate-qr"');
  }
}

// Function to show QR code in full screen modal
function showQRCodeFullScreen(): void {
  console.log('Showing QR code in full screen');
  
  // Create a modal for the QR code
  const qrModal = document.createElement('div');
  qrModal.className = 'modal qr-fullscreen-modal show';
  qrModal.style.display = 'block';
  qrModal.style.zIndex = '2000';
  
  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  modalContent.style.maxWidth = '350px';
  modalContent.onclick = function(e) {
    e.stopPropagation();
  };
  
  // Create close button
  const closeButton = document.createElement('span');
  closeButton.className = 'close-button';
  closeButton.innerHTML = '&times;';
  closeButton.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    document.body.removeChild(qrModal);
  };
  
  // Create QR image
  const qrImage = document.createElement('img');
  qrImage.className = 'donate-qr-fullscreen';
  qrImage.alt = 'GCash QR Code';
  qrImage.style.width = '100%';
  qrImage.style.height = 'auto';
  qrImage.style.maxWidth = '300px';
  qrImage.style.display = 'block';
  qrImage.style.margin = '0 auto';
  
  // Set image source with cache busting
  const timestamp = new Date().getTime();
  qrImage.src = `./src/assets/gcash-qr.jpg?t=${timestamp}`;
  
  // Create title
  const title = document.createElement('h2');
  title.textContent = 'GCash QR Code';
  title.style.textAlign = 'center';
  title.style.marginBottom = '1rem';
  
  // Create instructions
  const instructions = document.createElement('p');
  instructions.textContent = 'Scan this QR code with your GCash app';
  instructions.style.textAlign = 'center';
  instructions.style.marginBottom = '1rem';
  
  // Add account info
  const accountInfo = document.createElement('p');
  accountInfo.style.textAlign = 'center';
  accountInfo.style.marginTop = '1rem';
  accountInfo.innerHTML = '<strong>GCash Account:</strong> 09706436276 (JE****O G.)';
  
  // Add elements to modal
  modalContent.appendChild(closeButton);
  modalContent.appendChild(title);
  modalContent.appendChild(instructions);
  modalContent.appendChild(qrImage);
  modalContent.appendChild(accountInfo);
  qrModal.appendChild(modalContent);
  
  // Add click handler to close modal when clicking outside
  qrModal.onclick = function() {
    document.body.removeChild(qrModal);
  };
  
  // Add modal to body
  document.body.appendChild(qrModal);
}

// Copy GCash details
function copyGcashDetails(): void {
  const gcashText = gcashAccount?.textContent || '';
  if (gcashText) {
    navigator.clipboard.writeText(gcashText)
      .then(() => {
        copyGcashBtn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
          copyGcashBtn.innerHTML = '<i class="fas fa-copy"></i>';
        }, 2000);
        showImportToast('GCash details copied to clipboard!', 'success');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        showImportToast('Failed to copy GCash details', 'error');
      });
  }
}

// Excel Import Handler
function handleExcelImport(event: Event): void {
  const fileInput = event.target as HTMLInputElement;
  const file = fileInput.files?.[0];
  
  if (!file) {
    return;
  }
  
  // Display the file name
  fileNameDisplay.textContent = file.name;
  
  // Show loading in the textarea
  memberListTextarea.value = 'Loading data from Excel file...';
  
  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      // Parse Excel file
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      
      // Get first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (!jsonData || jsonData.length === 0) {
        throw new Error("No data found in the Excel file");
      }
      
      // Find the index of a column that likely contains names
      let nameColumnIndex = findNameColumnIndex(jsonData);
      
      if (nameColumnIndex === -1) {
        // If no obvious name column is found, default to first column but warn the user
        nameColumnIndex = 0;
        showImportToast('No column with "name" found. Using first column. You may need to edit the data.', 'warning');
      }
      
      // Extract names from the identified column
      let names: string[] = [];
      // Skip first row (headers)
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (row && row[nameColumnIndex] && (typeof row[nameColumnIndex] === 'string' || typeof row[nameColumnIndex] === 'number')) {
          const name = row[nameColumnIndex].toString().trim();
          if (name) {
            names.push(name);
          }
        }
      }
      
      // Update textarea with names
      if (names.length > 0) {
        memberListTextarea.value = names.join('\n');
        // Show success message with column name
        const headerRow = jsonData[0];
        const columnName = headerRow && headerRow[nameColumnIndex] 
          ? `"${headerRow[nameColumnIndex]}"` 
          : `column ${nameColumnIndex + 1}`;
        showImportToast(`Successfully imported ${names.length} names from ${columnName}`);
      } else {
        memberListTextarea.value = '';
        showImportToast('No names found in the selected column. Please check the file format.', 'error');
      }
      
      // Validate inputs after import
      validateInputs();
      
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      memberListTextarea.value = '';
      showImportToast('Error parsing Excel file. Please check the format.', 'error');
    }
  };
  
  reader.onerror = function() {
    memberListTextarea.value = '';
    showImportToast('Error reading file. Please try again.', 'error');
  };
  
  reader.readAsArrayBuffer(file);
}

// Function to find the column index that likely contains names
function findNameColumnIndex(data: any[][]): number {
  if (!data || data.length === 0 || !data[0]) {
    return -1;
  }
  
  const headers = data[0];
  
  // First, look for exact or common name-related headers
  const nameKeywords = ['name', 'names', 'full name', 'student name', 'employee name', 'member', 'members', 'participants'];
  
  // Case-insensitive search for name keywords in headers
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    if (header && typeof header === 'string') {
      const headerLower = header.toLowerCase();
      
      // Check for direct matches first
      if (nameKeywords.some(keyword => headerLower === keyword)) {
        return i;
      }
      
      // Then check for partial matches
      if (nameKeywords.some(keyword => headerLower.includes(keyword))) {
        return i;
      }
    }
  }
  
  // If no obvious name column, check data patterns in first few rows
  // This heuristic tries to identify name-like data (text with spaces, capitalized words)
  if (data.length > 2) {
    const sampleSize = Math.min(5, data.length - 1);
    const columnScores = new Array(headers.length).fill(0);
    
    for (let col = 0; col < headers.length; col++) {
      for (let row = 1; row <= sampleSize; row++) {
        const cell = data[row][col];
        if (cell && typeof cell === 'string') {
          // Check for spaces (likely full names)
          if (cell.includes(' ')) {
            columnScores[col] += 2;
          }
          
          // Check for capitalized words
          if (/^[A-Z][a-z]+/.test(cell)) {
            columnScores[col] += 1;
          }
          
          // Lower score for numeric-only values
          if (/^\d+$/.test(cell)) {
            columnScores[col] -= 3;
          }
        }
      }
    }
    
    // Find column with highest score
    let maxScore = -1;
    let maxScoreIndex = -1;
    
    for (let i = 0; i < columnScores.length; i++) {
      if (columnScores[i] > maxScore) {
        maxScore = columnScores[i];
        maxScoreIndex = i;
      }
    }
    
    if (maxScore > 0) {
      return maxScoreIndex;
    }
  }
  
  return -1; // No suitable column found
}

// Simple toast notification for import results
function showImportToast(message: string, type: 'success' | 'error' | 'warning' = 'success'): void {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `import-toast ${type}`;
  
  // Choose icon based on message type
  let icon = 'fa-check-circle';
  if (type === 'error') icon = 'fa-exclamation-circle';
  if (type === 'warning') icon = 'fa-exclamation-triangle';
  
  toast.innerHTML = `
    <i class="fas ${icon}"></i>
    <span>${message}</span>
  `;
  
  // Append to body
  document.body.appendChild(toast);
  
  // Show toast with animation
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 4000);
}

// Validation function
function validateInputs(): void {
  const numGroups = parseInt(numGroupsInput.value);
  const memberListText = memberListTextarea.value.trim();
  
  const memberNames = memberListText.split('\n')
    .map(name => name.trim())
    .filter(name => name.length > 0);
  
  let isValid = true;
  let buttonText = "Generate Groups";
  
  // Reset styles
  numGroupsInput.style.borderColor = '';
  memberListTextarea.style.borderColor = '';
  
  if (numGroups <= 0) {
    numGroupsInput.style.borderColor = '#ff4d6d';
    isValid = false;
    buttonText = "Enter valid group number";
  }
  
  if (memberNames.length === 0) {
    memberListTextarea.style.borderColor = '#ff4d6d';
    isValid = false;
    buttonText = "Enter member names";
  } else if (numGroups > memberNames.length) {
    numGroupsInput.style.borderColor = '#ff4d6d';
    isValid = false;
    buttonText = "Too many groups for members";
  }
  
  generateGroupsButton.disabled = !isValid;
  generateGroupsButton.textContent = isValid ? "Generate Groups" : buttonText;
  
  // Restore icon if button is valid
  if (isValid) {
    generateGroupsButton.innerHTML = '<i class="fas fa-random"></i> Generate Groups';
  }
}

// Core Functions
function generateGroups(): void {
  // Show loading state
  generateGroupsButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
  generateGroupsButton.disabled = true;
  
  // Use setTimeout to allow UI to update before processing
  setTimeout(() => {
    // Get input values
    const numGroups = parseInt(numGroupsInput.value);
    const memberListText = memberListTextarea.value.trim();
    const equalDistribution = equalDistributionCheckbox.checked;

    // Parse member list
    const memberNames = memberListText.split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    // Create member objects with IDs
    const members: Member[] = memberNames.map((name, index) => ({
      name,
      id: index
    }));

    // Shuffle members
    const shuffledMembers = shuffleArray([...members]);

    // Distribute members into groups
    const groups = distributeMembers(shuffledMembers, numGroups, equalDistribution);

    // Display results
    displayResults(groups);

    // Save to session storage
    saveToSessionStorage();

    // Enable download button
    downloadButton.disabled = false;
    
    // Reset generate button
    generateGroupsButton.innerHTML = '<i class="fas fa-random"></i> Generate Groups';
    generateGroupsButton.disabled = false;
    
    // Scroll to results on mobile
    if (window.innerWidth < 768) {
      resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, 500); // Short delay for UI feedback
}

function shuffleArray<T>(array: T[]): T[] {
  // Fisher-Yates shuffle algorithm
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function distributeMembers(members: Member[], numGroups: number, equalDistribution: boolean): Group[] {
  const groups: Group[] = Array.from({ length: numGroups }, (_, i) => ({
    name: `Group ${i + 1}`,
    members: []
  }));

  if (equalDistribution) {
    // Equal distribution - attempt to make all groups have similar sizes
    const membersPerGroup = Math.floor(members.length / numGroups);
    const extraMembers = members.length % numGroups;

    let memberIndex = 0;
    for (let i = 0; i < numGroups; i++) {
      const groupSize = i < extraMembers ? membersPerGroup + 1 : membersPerGroup;
      groups[i].members = members.slice(memberIndex, memberIndex + groupSize);
      memberIndex += groupSize;
    }
  } else {
    // Simple distribution - just split them up randomly
    for (let i = 0; i < members.length; i++) {
      const groupIndex = i % numGroups;
      groups[groupIndex].members.push(members[i]);
    }
  }

  return groups;
}

function displayResults(groups: Group[]): void {
  // Clear previous results
  groupResults.innerHTML = '';
  
  // Update summary stats
  const totalMembers = groups.reduce((sum, group) => sum + group.members.length, 0);
  summaryStats.textContent = `Total: ${totalMembers} members distributed across ${groups.length} groups`;

  // Create group containers with staggered animation
  groups.forEach((group, index) => {
    const groupContainer = document.createElement('div');
    groupContainer.className = 'group-container';
    groupContainer.style.opacity = '0';
    groupContainer.style.transform = 'translateY(20px)';
    groupContainer.style.transition = 'all 0.3s ease';

    const groupHeader = document.createElement('div');
    groupHeader.className = 'group-header';
    groupHeader.textContent = `${group.name} (${group.members.length} members)`;

    const groupMembers = document.createElement('div');
    groupMembers.className = 'group-members';

    const membersList = document.createElement('ul');
    group.members.forEach(member => {
      const listItem = document.createElement('li');
      listItem.textContent = member.name;
      membersList.appendChild(listItem);
    });

    groupMembers.appendChild(membersList);
    groupContainer.appendChild(groupHeader);
    groupContainer.appendChild(groupMembers);
    groupResults.appendChild(groupContainer);
    
    // Trigger animation with staggered delay
    setTimeout(() => {
      groupContainer.style.opacity = '1';
      groupContainer.style.transform = 'translateY(0)';
    }, 100 * index);
  });

  // Make results visible if they weren't already
  resultsSection.style.display = 'block';
}

function clearAll(): void {
  // Show loading effect
  clearAllButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Clearing...';
  
  setTimeout(() => {
    // Clear inputs
    numGroupsInput.value = '2';
    memberListTextarea.value = '';
    equalDistributionCheckbox.checked = true;
    
    // Reset file input and filename display
    excelFileInput.value = '';
    fileNameDisplay.textContent = '';
    
    // Reset styles
    numGroupsInput.style.borderColor = '';
    memberListTextarea.style.borderColor = '';

    // Clear results with fade out effect
    if (groupResults.innerHTML !== '') {
      resultsSection.style.opacity = '0';
      resultsSection.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        // Clear results
        groupResults.innerHTML = '';
        summaryStats.textContent = '';
        downloadButton.disabled = true;
        
        // Reset display
        resultsSection.style.opacity = '1';
        resultsSection.style.transform = 'translateY(0)';
      }, 300);
    }

    // Clear session storage
    sessionStorage.removeItem('groupGeneratorState');
    
    // Reset button
    clearAllButton.innerHTML = '<i class="fas fa-trash"></i> Clear All';
    generateGroupsButton.innerHTML = '<i class="fas fa-random"></i> Generate Groups';
    generateGroupsButton.disabled = false;
  }, 300);
}

function downloadResults(): void {
  // Show loading state
  downloadButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';
  
  setTimeout(() => {
    // Get the current groups data
    const groupsData = Array.from(document.querySelectorAll('.group-container')).map(container => {
      const groupName = container.querySelector('.group-header')?.textContent?.split('(')[0].trim() || 'Unknown Group';
      const members = Array.from(container.querySelectorAll('.group-members li')).map(li => li.textContent || '');
      return { groupName, members };
    });

    // Create CSV content
    let csvContent = 'Group,Member\n';
    
    groupsData.forEach(group => {
      group.members.forEach(member => {
        csvContent += `"${group.groupName}","${member}"\n`;
      });
    });

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `group_assignments_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    
    // Reset button and download
    downloadButton.innerHTML = '<i class="fas fa-download"></i> Download Results';
    link.click();
    document.body.removeChild(link);
  }, 500);
}

// Session Storage Functions
function saveToSessionStorage(): void {
  const state = {
    numGroups: numGroupsInput.value,
    memberList: memberListTextarea.value,
    equalDistribution: equalDistributionCheckbox.checked,
    results: groupResults.innerHTML,
    summary: summaryStats.textContent
  };
  
  sessionStorage.setItem('groupGeneratorState', JSON.stringify(state));
}

function loadFromSessionStorage(): void {
  const savedState = sessionStorage.getItem('groupGeneratorState');
  if (savedState) {
    const state = JSON.parse(savedState);
    
    numGroupsInput.value = state.numGroups;
    memberListTextarea.value = state.memberList;
    equalDistributionCheckbox.checked = state.equalDistribution;
    
    if (state.results && state.summary) {
      groupResults.innerHTML = state.results;
      summaryStats.textContent = state.summary;
      resultsSection.style.display = 'block';
      downloadButton.disabled = false;
    }
  }
} 