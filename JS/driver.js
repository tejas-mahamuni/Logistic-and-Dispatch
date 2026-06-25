const toggleRegister = document.getElementById("toggle-register");
const toggleUpdate = document.getElementById("toggle-update");
const toggleDelete = document.getElementById("toggle-delete");    

const fetchId = document.getElementById("fetch-id");

const registerBtn = document.getElementById("register-btn");
const updateBtn = document.getElementById("update-btn");
const deleteBtn = document.getElementById("delete-btn");


toggleRegister.addEventListener("click", () => {
  toggleRegister.classList.add("active");
  toggleUpdate.classList.remove("active");
  toggleDelete.classList.remove("active");

  fetchId.classList.add("d-none");
  registerBtn.classList.remove("d-none");
  updateBtn.classList.add("d-none");
  deleteBtn.classList.add("d-none");
});

toggleUpdate.addEventListener("click", () => {
  toggleRegister.classList.remove("active");
  toggleUpdate.classList.add("active");
  toggleDelete.classList.remove("active");

  fetchId.classList.remove("d-none");

  registerBtn.classList.add("d-none");
  updateBtn.classList.remove("d-none");
  deleteBtn.classList.add("d-none");
});

toggleDelete.addEventListener("click", () => {
  toggleRegister.classList.remove("active");
  toggleUpdate.classList.remove("active");
  toggleDelete.classList.add("active");

  fetchId.classList.remove("d-none");
  registerBtn.classList.add("d-none");
  updateBtn.classList.add("d-none");
  deleteBtn.classList.remove("d-none");
});



const driverId = document.getElementById("driver-id");
const driverName = document.getElementById("driver-name");
const driverPhone = document.getElementById("driver-phone");
const licenseNumber = document.getElementById("license");

document.getElementById("fetch-btn").addEventListener("click", async () => {
    const id = driverId.value.trim();
    
    if (!id) {
        alert("Enter Driver ID !");
        return
    }

    try {
        const response = await fetch (`http://localhost:3000/driver/${id}`);

        if (!response.ok) {
            throw new Error("Driver not found");
        }

        const data = await response.json();
        driverName.value = data.driverName;
        driverPhone.value = data.driverPhone;
        licenseNumber.value = data.licenseNumber;
    }
    catch (err){
        console.error(err);
        alert("Driver not found");
    }
});

document.getElementById("register-btn").addEventListener("click", async () => {

    try {
        const response = await fetch ("http://localhost:3000/driver", {
            method: "POST",
            headers: {
                "Content-type":
                "application/json"
            },
            body: JSON.stringify({
                driverName: driverName.value.trim(),
                driverPhone: driverPhone.value.trim(),
                licenseNumber: licenseNumber.value.trim()
            })

        });

        const data = await response.json();

        alert(data.message);
    }
    catch(err) {
        console.error(err);
        alert("Unable to add Customer");
    }
});

document.getElementById("update-btn").addEventListener("click", async () => {

    const id = driverId.value.trim();

    if (!id) {
        alert("Enter valid Driver ID to Update")
    }

    try {
        const response = await fetch (`http://localhost:3000/driver/${id}`, {
            method: "PUT",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                driverName: driverName.value,
                driverPhone: driverPhone.value,
                licenseNumber: licenseNumber.value
            })
        });
        const data = await response.json();

        alert(data.message);
    }
    catch(err) {
        console.error(err);
        alert("Unable to add Driver");
    }
});

document.getElementById("delete-btn").addEventListener("click", async () => {

    const id = driverId.value.trim();

    if (!id) {
        alert("Enter valid Driver ID to Update")
    }

    try {
        const response = await fetch (`http://localhost:3000/driver/${id}`, {
            method: "DELETE",
        });

        const data = await response.json();
        alert(data.message);
    }
    catch(err) {
        console.error(err);
        alert("Unable to add Driver");
    }
});

document.getElementById("clear-btn").addEventListener("click", async () => {
    driverId.value = "";
    driverName.value = "";
    driverPhone.value = "";
    licenseNumber.value = "";
});
