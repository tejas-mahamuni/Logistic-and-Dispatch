const driverId = document.getElementById("driver-id");
const driverName = document.getElementById("driver-name");
const driverPhone = document.getElementById("driver-phone");
const licenseNumber = document.getElementById("license");

document.getElementById("fetch").addEventListener("click", async () => {
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

document.getElementById("register").addEventListener("click", async () => {

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
        alert("Unable to add Driver");
    }
});

document.getElementById("update").addEventListener("click", async () => {

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
        alert("Unable to add Driver");
    }
});

document.getElementById("delete").addEventListener("click", async () => {

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

document.getElementById("clear").addEventListener("click", async () => {
    driverId.value = "";
    driverName.value = "";
    driverPhone.value = "";
    licenseNumber.value = "";
});