const customerId = document.getElementById("id");
const customerName = document.getElementById("name");
const customerAddress = document.getElementById("address");
const customerPhone = document.getElementById("phone");

document.getElementById("fetch").addEventListener("click", async () => {
    const id = customerId.value.trim();
    
    if (!id) {
        alert("Enter Customer ID !");
        return
    }

    try {
        const response = await fetch (`http://localhost:3000/customer/${id}`);

        if (!response.ok) {
            throw new Error("Customer not found");
        }

        const data = await response.json();
        customerName.value = data.customerName;
        customerAddress.value = data.customerAddress;
        customerPhone.value = data.customerPhone;
    }
    catch (err){
        console.error(err);
        alert("Customer not found");
    }
});

document.getElementById("register").addEventListener("click", async () => {

    try {
        const response = await fetch ("http://localhost:3000/customer", {
            method: "POST",
            headers: {
                "Content-type":
                "application/json"
            },
            body: JSON.stringify({
                customerName: customerName.value.trim(),
                customerAddress: customerAddress.value.trim(),
                customerPhone: customerPhone.value.trim()
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

document.getElementById("update").addEventListener("click", async () => {

    const id = customerId.value.trim();

    if (!id) {
        alert("Enter valid Customer ID to Update")
    }

    try {
        const response = await fetch (`http://localhost:3000/customer/${id}`, {
            method: "PUT",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                customerName: customerName.value,
                customerAddress: customerAddress.value,
                customerPhone: customerPhone.value
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

document.getElementById("delete").addEventListener("click", async () => {

    const id = customerId.value.trim();

    if (!id) {
        alert("Enter valid Customer ID to Update")
    }

    try {
        const response = await fetch (`http://localhost:3000/customer/${id}`, {
            method: "DELETE",
        });

        const data = await response.json();
        alert(data.message);
    }
    catch(err) {
        console.error(err);
        alert("Unable to add Customer");
    }
});

document.getElementById("clear").addEventListener("click", async () => {
    customerId.value = "";
    customerName.value = "";
    customerAddress.value = "";
    customerPhone.value = "";
});