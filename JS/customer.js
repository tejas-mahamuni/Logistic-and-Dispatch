const toggleRegister = document.getElementById("toggle-register");
const toggleUpdate = document.getElementById("toggle-update");

const fetchId = document.getElementById("fetch-id");
const prevNext = document.getElementById("prev-next");

const registerBtn = document.getElementById("register-btn");
const updateBtn = document.getElementById("update-btn");


toggleRegister.addEventListener("click", () => {
    toggleRegister.classList.add("active");
    toggleUpdate.classList.remove("active");

    fetchId.classList.add("d-none");

    registerBtn.classList.remove("d-none");
    updateBtn.classList.add("d-none");

    prevNext.classList.add("d-none");
});

toggleUpdate.addEventListener("click", () => {
    toggleRegister.classList.remove("active");
    toggleUpdate.classList.add("active");

    fetchId.classList.remove("d-none");

    registerBtn.classList.add("d-none");
    updateBtn.classList.remove("d-none");

    prevNext.classList.remove("d-none");
});

const customerId = document.getElementById("id");
const customerName = document.getElementById("name");
const customerAddress = document.getElementById("address");
const customerPhone = document.getElementById("phone");

document.getElementById("fetch-btn").addEventListener("click", async () => {
    const id = customerId.value.trim();

    if (!id) {
        Swal.fire({
            position: "center",
            icon: "error",
            title: "Enter Customer ID",
            showConfirmButton: false,
            timer: 1500,
        });
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/customer/${id}`);

        if (!response.ok) {
            throw new Error("Customer not found");
        }

        const data = await response.json();
        customerName.value = data.customerName;
        customerAddress.value = data.customerAddress;
        customerPhone.value = data.customerPhone;
    } catch (err) {
        console.error(err);

        Swal.fire({
            position: "center",
            icon: "error",
            title: "Customer not found",
            showConfirmButton: false,
            timer: 1500,
        });
    }
});

document.getElementById("register-btn").addEventListener("click", async () => {

    if (!customerName.value || !customerAddress.value || !customerPhone.value) {
        Swal.fire({
            position: "center",
            icon: "error",
            title: "Please fill in all fields",
            showConfirmButton: true
        });
        return; 
    }

    try {
        const response = await fetch("http://localhost:3000/customer", {
            method: "POST",
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify({
                customerName: customerName.value.trim(),
                customerAddress: customerAddress.value.trim(),
                customerPhone: customerPhone.value.trim(),
            }),
        });

        const data = await response.json();

        Swal.fire({
            position: "center",
            icon: "success",
            title: data.message,
            showConfirmButton: false,
            timer: 1500,
        });
    } catch (err) {
        console.error(err);
        
        Swal.fire({
            position: "center",
            icon: "error",
            title: "Unable to add Customer",
            showConfirmButton: false,
            timer: 1500,
        });
    }
});

document.getElementById("update-btn").addEventListener("click", async () => {
    const id = customerId.value.trim();

    if (!id) {
        Swal.fire({
            position: "center",
            icon: "error",
            title: "Enter valid Customer ID to Update",
            showConfirmButton: false,
            timer: 1500,
        });
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/customer/${id}`, {
            method: "PUT",
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify({
                customerName: customerName.value,
                customerAddress: customerAddress.value,
                customerPhone: customerPhone.value,
            }),
        });
        const data = await response.json();

        Swal.fire({
            position: "center",
            icon: "success",
            title: data.message,
            showConfirmButton: false,
            timer: 1500,
        });

    } catch (err) {
        console.error(err);

        Swal.fire({
            position: "center",
            icon: "error",
            title: "Unable to update Customer",
            showConfirmButton: false,
            timer: 1500,
        });
    }
});


document.getElementById("clear-btn").addEventListener("click", async () => {
    customerId.value = "";
    customerName.value = "";
    customerAddress.value = "";
    customerPhone.value = "";
});

document.getElementById("next-btn").addEventListener("click", async () => {
    let id = customerId.value.trim();

    if (!id || id === "") {
        id = 0;
    }

    try {
        const response = await fetch (`http://localhost:3000/customer/next/${id}`);

        if (!response.ok) {
            Swal.fire({
            position: "center",
            icon: "success",
            title: "End of Customers",
            showConfirmButton: false,
            timer: 1500,
        });
        return;
        }

        const data = await response.json();
        customerId.value = data.customerId;
        customerName.value = data.customerName;
        customerAddress.value = data.customerAddress;
        customerPhone.value = data.customerPhone;
    }
    catch (err) {
        Swal.fire({
            position: "center",
            icon: "success",
            title: "End of Customers",
            showConfirmButton: false,
            timer: 1500,
        });
        return;
    }
});

document.getElementById("previous-btn").addEventListener("click", async () => {
    let id = customerId.value.trim();

    if (!id || id === "") {
        id = 2;
    }

    try {
        const response = await fetch(`http://localhost:3000/customer/previous/${id}`);

    if (!response.ok) {
        Swal.fire({
            position: "center",
            icon: "success",
            title: "End of Customers",
            showConfirmButton: false,
            timer: 1500,
        });
        return;
    };

    const data = await response.json();
    customerId.value = data.customerId;
    customerName.value = data.customerName;
    customerAddress.value = data.customerAddress;
    customerPhone.value = data.customerPhone;
    }
    catch (err) {
        Swal.fire({
            position: "center",
            icon: "success",
            title: "End of Customers",
            showConfirmButton: false,
            timer: 1500,
        })
        return;
    }
});
