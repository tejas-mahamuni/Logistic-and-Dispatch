


const id = document.getElementById("vehicle-id");
const num = document.getElementById("vehicle-number");
const type = document.getElementById("vehicle-type");
const cap = document.getElementById("capacity");
const btnSave = document.getElementById("save-btn");
const btnUpdate = document.getElementById("update-btn");
const btnPrev = document.getElementById("previous-btn");
const btnNext = document.getElementById("next-btn");
const btnExit = document.getElementById("exit-btn");
const radioFind = document.getElementById("mode-find");
const radioNew = document.getElementById("mode-new");
const toggle = document.getElementById("mode-toggle");
const alert = document.getElementById("id-alert");

//API Connection 
const API_BASE = "http://127.0.0.1:3000";

let recordId = null;
let savedState = null;
let dirty = false;
let mode = "find";
let sessionId = null;
let navigating = false;


function equals(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}


function getState() {
  return {
    vehicleNumber: num.value.trim(),
    vehicleType: type.value.trim(),
    capacity: cap.value.trim(),
  };
}

//Check unsaved changes
function checkDirty() {
  if (!savedState) return false;
  return !equals(getState(), savedState);
}

// Mark form clean
function saveState(state) {
  savedState = state || getState();
  dirty = false;
}

//Show alert popup
function showAlert(type, message) {
  return Swal.fire({
    position: "center",
    icon: type,
    title: message,
    showConfirmButton: false,
    timer: 1800,
  });
}

// Show error inline
function showError(message) {
  if (!alert) return;
  alert.textContent = message;
  alert.style.display = "block";
}

// Hide error message
function hideError() {
  if (!alert) return;
  alert.textContent = "";
  alert.style.display = "none";
}

//save/update button
function switchMode(isUpdate) {
  if (isUpdate) {
    btnSave.style.display = "none";
    btnUpdate.style.display = "inline-flex";
  } else {
    btnSave.style.display = "inline-flex";
    btnUpdate.style.display = "none";
  }
}

// Clear input fields
function clearFields() {
  num.value = "";
  type.value = "";
  cap.value = "";
}

// Adjust slider width
function updateSlider() {
  const labelFind = toggle.querySelector("label[for='mode-find']");
  const labelNew = toggle.querySelector("label[for='mode-new']");
  const slide = toggle.querySelector(".slider");
  if (!labelFind || !labelNew || !slide) return;

  requestAnimationFrame(() => {
    const wFind = labelFind.offsetWidth;
    const wNew = labelNew.offsetWidth;
    toggle.style.setProperty("--slider-shift", wFind + "px");
    slide.style.width = (mode === "find" ? wFind : wNew) + "px";
  });
}

// Switch to Find mode
function switchFind() {
  mode = "find";
  radioFind.checked = true;
  id.removeAttribute("placeholder");
  id.readOnly = false;
  id.classList.remove("id-locked");
  updateSlider();
}

// Switch to New mode
function switchNew() {
  mode = "new";
  radioNew.checked = true;
  id.placeholder = "Auto-assigned";
  id.readOnly = true;
  id.classList.add("id-locked");
  updateSlider();
}

// Get vehicle by ID
function getVehicle(vid) {
  return fetch(`${API_BASE}/vehicle/${vid}`)
    .then(res => res.ok ? res.json() : null)
    .catch(() => null);
}

// Get next vehicle ID
function getNextId() {
  return fetch(`${API_BASE}/vehicle/next-id`)
    .then(res => res.ok ? res.json() : null)
    .then(data => data ? data.nextId : null)
    .catch(() => null);
}

// Load vehicle types dropdown
function loadTypes() {
  type.disabled = true;
  type.innerHTML = "<option value=''>Loading vehicle types...</option>";
  
  return fetch(`${API_BASE}/vehicle/types`)
    .then(res => {
      if (!res.ok) throw new Error("Load failed");
      return res.json();
    })
    .then(types => {
      type.innerHTML = "<option value=''>Select Vehicle Type</option>";
      if (!Array.isArray(types) || types.length === 0) {
        type.innerHTML = "<option value=''>No vehicle types configured</option>";
        return;
      }
      types.forEach(t => {
        const opt = document.createElement("option");
        opt.value = opt.textContent = t;
        type.appendChild(opt);
      });
    })
    .catch(() => {
      type.innerHTML = "<option value=''>Unable to load vehicle types</option>";
    })
    .finally(() => {
      type.disabled = false;
    });
}

//Fill form with record data
function fillForm(record) {
  recordId = record.vehicleId;
  id.value = record.vehicleId;
  num.value = record.vehicleNumber || "";
  type.value = record.vehicleType || "";
  cap.value = record.capacity || "";
  switchMode(true);
  saveState();
  hideError();
}

//Find vehicle by ID
function search() {
  const searchId = id.value.trim();
  if (!searchId) {
    showAlert("info", "Enter a Vehicle ID to search.");
    return Promise.resolve();
  }
  
  return getVehicle(searchId).then(record => {
    if (!record) {
      clearFields();
      recordId = null;
      switchMode(false);
      showError(` Vehicle ID "${searchId}" does not exist.`);
      return;
    }
    hideError();
    fillForm(record);
  });
}

//Create new vehicle record
function addNew() {
  return getNextId().then(nextId => {
    if (!nextId) {
      showAlert("error", "Unable to reserve a new Vehicle ID.");
      return;
    }
    id.value = nextId;
    sessionId = String(nextId);
    clearFields();
    recordId = null;
    switchMode(false);
    saveState(getState());
    num.focus();
  });
}

// Validate form data
function validate() {
  const number = num.value.trim();
  const vtype = type.value.trim();
  const capacity = cap.value.trim();
  const regex = /^[A-Z0-9 \-]{3,15}$/i;

  if (!number || !vtype) {
    showAlert("error", "Please fill required fields: Vehicle Number and Type.");
    return false;
  }
  if (!regex.test(number)) {
    showAlert("error", "Vehicle Number must be 3–15 characters (letters, numbers, hyphen).");
    return false;
  }
  if (capacity && (isNaN(capacity) || Number(capacity) <= 0)) {
    showAlert("error", "Capacity must be a valid positive number if provided.");
    return false;
  }
  return true;
}

//Check unsaved
function checkNav(callback) {
  if (navigating) return Promise.resolve();
  if (!dirty) return callback();

  navigating = true;
  
  return Swal.fire({
    title: "Unsaved Changes",
    text: "You have unsaved changes. What would you like to do?",
    icon: "warning",
    showCancelButton: true,
    showDenyButton: true,
    confirmButtonText: recordId ? "Update & Continue" : "Save & Continue",
    denyButtonText: "Discard Changes",
    cancelButtonText: "Stay Here",
    reverseButtons: false,
  }).then(result => {
    if (result.isConfirmed) {
      const savePromise = recordId ? update(true) : save();
      return savePromise.then(ok => {
        if (!ok) {
          navigating = false;
          return;
        }
        return callback();
      });
    } else if (result.isDenied) {
      saveState();
      dirty = false;
      return callback();
    }
    navigating = false;
  }).catch(() => {
    navigating = false;
  });
}

// Save new vehicle
function save() {
  if (!validate()) return Promise.resolve(false);

  const payload = {
    vehicleNumber: num.value.trim(),
    vehicleType: type.value.trim(),
    capacity: cap.value.trim(),
  };
  if (id.value.trim()) payload.vehicleId = Number(id.value.trim());

  return fetch(`${API_BASE}/vehicle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then(res => res.json().then(data => ({ res, data })))
    .then(({ res, data }) => {
      if (!res.ok) {
        showAlert("error", data.message || "Unable to save vehicle.");
        return false;
      }
      const aId = data.vehicleId || id.value.trim();
      return showAlert("success", `Vehicle ID ${aId} saved! Ready for next entry.`)
        .then(() => addNew())
        .then(() => true);
    })
    .catch(() => {
      showAlert("error", "Unable to save vehicle.");
      return false;
    });
}

//Update vehicle
function update(silent = false) {
  const uid = id.value.trim();
  if (!uid) {
    showAlert("error", "Enter a valid Vehicle ID to update.");
    return Promise.resolve(false);
  }
  if (!validate()) return Promise.resolve(false);

  const current = getState();

  if (savedState && equals(current, savedState)) {
    showAlert("info", "No changes detected. Nothing was updated.");
    saveState(current);
    return Promise.resolve(true);
  }

  if (!silent) {
    return Swal.fire({
      title: "Confirm Update",
      html: `Are you sure you want to update <b>Vehicle ID ${uid}</b>?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Update",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d97706",
      cancelButtonColor: "#6b7280",
    }).then(confirm => {
      if (!confirm.isConfirmed) return false;
      return sendUpdate(uid, current);
    });
  }

  return sendUpdate(uid, current);
}

//Send update
function sendUpdate(uid, current) {
  return fetch(`${API_BASE}/vehicle/${uid}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(current),
  })
    .then(res => res.json().then(data => ({ res, data })))
    .then(({ res, data }) => {
      if (!res.ok) {
        showAlert("error", data.message || "Unable to update vehicle.");
        return false;
      }
      recordId = Number(uid);
      switchMode(true);
      return Swal.fire({
        position: "center",
        icon: "success",
        title: "Updated!",
        text: data.message || `Vehicle ID ${uid} updated successfully.`,
        showConfirmButton: false,
        timer: 2000,
      }).then(() => {
        saveState(current);
        return true;
      });
    })
    .catch(() => {
      showAlert("error", "Unable to update vehicle.");
      return false;
    });
}
[num, type, cap].forEach(el => {
  el.addEventListener("input", () => {
    dirty = checkDirty();
  });
});

//Mode Find
radioFind.addEventListener("change", () => {
  if (!radioFind.checked) return;
  checkNav(() => {
    switchFind();
    clearFields();
    id.value = "";
    recordId = null;
    sessionId = null;
    switchMode(false);
    saveState(getState());
    hideError();
    updateSlider();
    return Promise.resolve();
  });
});

//Mode  New
radioNew.addEventListener("change", () => {
  if (!radioNew.checked) return;
  checkNav(() => {
    switchNew();
    id.value = "";
    sessionId = null;
    hideError();
    updateSlider();
    return addNew();
  });
});

let timer = null;

id.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  e.preventDefault();
  if (mode === "find") {
    clearTimeout(timer);
    hideError();
    checkNav(search);
  } else {
    num.focus();
  }
});

//Type in ID field
id.addEventListener("input", () => {
  if (mode !== "find") return;
  const sId = id.value.trim();
  clearTimeout(timer);
  hideError();
  if (!sId) {
    clearFields();
    recordId = null;
    switchMode(false);
    saveState(getState());
    return;
  }
  timer = setTimeout(() => {
    if (recordId && String(recordId) === sId) return;
    checkNav(search);
  }, 400);
});

//Leave ID field
id.addEventListener("blur", () => {
  if (mode !== "find") return;
  if (navigating) return;
  const sId = id.value.trim();
  if (!sId) return;
  if (recordId && String(recordId) === sId) return;
  clearTimeout(timer);
  checkNav(search);
});

//Save 
btnSave.addEventListener("click", () => {
  save();
});

//Update 
btnUpdate.addEventListener("click", () => {
  update(false);
});


//Previous vehicle
btnPrev.addEventListener("click", () => {
  checkNav(() => {
    const inId = id.value.trim();
    const sId = inId || (recordId ? String(recordId) : null);

    if (!sId) {
      return Swal.fire({
        icon: "info",
        title: "No Record Loaded",
        text: "Please load a vehicle record first before navigating.",
        confirmButtonText: "OK",
        confirmButtonColor: "#4f46e5",
      });
    }

    return fetch(`${API_BASE}/vehicle/previous/${sId}`)
      .then(res => {
        if (!res.ok) {
          return Swal.fire({
            icon: "warning",
            title: "Beginning of List",
            html: `<p>You are already at the <b>first record</b>.<br>There is no previous data to show.</p>`,
            confirmButtonText: "OK",
            confirmButtonColor: "#4f46e5",
            footer: `<small>Switch to <b>New</b> mode to add more records.</small>`,
          });
        }
        return res.json().then(fillForm);
      })
      .catch(() => {
        showAlert("error", "Unable to load previous vehicle.");
      });
  });
});

//Next id 
btnNext.addEventListener("click", () => {
  checkNav(() => {
    const nextId = id.value.trim() || "0";

    return fetch(`${API_BASE}/vehicle/next/${nextId}`)
      .then(res => {
        if (!res.ok) {
          return Swal.fire({
            icon: "warning",
            title: "End of List",
            html: `<p>You have reached the <b>last record</b>.<br>No more data to show.</p>
                   <p style="margin-top:8px;">Would you like to add a new vehicle?</p>`,
            showCancelButton: true,
            confirmButtonText: "Switch to New Mode",
            cancelButtonText: "Stay Here",
            confirmButtonColor: "#16a34a",
            cancelButtonColor: "#6b7280",
          }).then(result => {
            if (result.isConfirmed) {
              radioNew.checked = true;
              switchNew();
              id.value = "";
              sessionId = null;
              hideError();
              updateSlider();
              return addNew();
            }
          });
        }
        return res.json().then(fillForm);
      })
      .catch(() => {
        showAlert("error", "Unable to load next vehicle.");
      });
  });
});

//exit
if (btnExit) {
  btnExit.addEventListener("click", (e) => {
    if (!dirty) return;
    e.preventDefault();
    Swal.fire({
      title: "Unsaved Changes",
      text: "You have unsaved changes. Leave without saving?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Leave",
      cancelButtonText: "Stay",
    }).then(res => {
      if (res.isConfirmed) {
        window.location = btnExit.href;
      }
    });
  });
}

//clear form 
function clear() {
  id.value = "";
  clearFields();
  recordId = null;
  dirty = false;
  switchMode(false);
  savedState = getState();
  hideError();
}

//Initialize page
function initiliazepage() {
  loadTypes().then(() => {
    clear();
    switchFind();
    setTimeout(updateSlider, 50);
  });
}

initiliazepage();