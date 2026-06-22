const vehicleId = document.getElementById("vehicleId");
const vehicleNumber = document.getElementById("vehicleNumber");
const vehicleType = document.getElementById("vehicleType");
const capacity = document.getElementById("capacity");


// FETCH VEHICLE

document.getElementById("fetchBtn").addEventListener("click", async () => {

    const id = vehicleId.value.trim();

    if (!id) {
        alert("Please enter Vehicle ID");
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:3000/vehicle/${id}`
        );

        if (!response.ok) {
            throw new Error("Vehicle Not Found");
        }

        const data = await response.json();

        vehicleNumber.value = data.vehicleNumber;
        vehicleType.value = data.vehicleType;
        capacity.value = data.capacity;

    } catch (err) {

        console.error(err);
        alert("Vehicle Not Found");

    }

});


// ADD VEHICLE

document.getElementById("saveBtn").addEventListener("click", async () => {

    try {

        const response = await fetch(
            "http://localhost:3000/vehicle",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    vehicleNumber: vehicleNumber.value,
                    vehicleType: vehicleType.value,
                    capacity: capacity.value
                })
            }
        );

        const data = await response.json();

        alert(data.message);

    } catch (err) {

        console.error(err);
        alert("Unable to Add Vehicle");

    }

});


// UPDATE VEHICLE

document.getElementById("updateBtn").addEventListener("click", async () => {

    const id = vehicleId.value.trim();

    if (!id) {
        alert("Please enter Vehicle ID");
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:3000/vehicle/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    vehicleNumber: vehicleNumber.value,
                    vehicleType: vehicleType.value,
                    capacity: capacity.value
                })
            }
        );

        const data = await response.json();

        alert(data.message);

    } catch (err) {

        console.error(err);
        alert("Update Failed");

    }

});


// DELETE VEHICLE

document.getElementById("deleteBtn").addEventListener("click", async () => {

    const id = vehicleId.value.trim();

    if (!id) {
        alert("Please enter Vehicle ID");
        return;
    }

    const confirmDelete = confirm(
        "Are you sure you want to delete this vehicle?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:3000/vehicle/${id}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        alert(data.message);

        clearForm();

    } catch (err) {

        console.error(err);
        alert("Delete Failed");

    }

});


// CLEAR FORM

document.getElementById("clearBtn")
.addEventListener("click", clearForm);

function clearForm() {

    vehicleId.value = "";
    vehicleNumber.value = "";
    vehicleType.value = "";
    capacity.value = "";

}