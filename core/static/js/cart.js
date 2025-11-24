document.addEventListener("DOMContentLoaded", () => {

    const plusBtns = document.querySelectorAll(".qty-btn.plus");
    const minusBtns = document.querySelectorAll(".qty-btn.minus");
    const qtyInputs = document.querySelectorAll(".qty-input");

    plusBtns.forEach(btn => btn.addEventListener("click", () => changeQty(btn, "plus")));
    minusBtns.forEach(btn => btn.addEventListener("click", () => changeQty(btn, "minus")));
    qtyInputs.forEach(inp => inp.addEventListener("input", () => changeQty(inp, "input")));

   function changeQty(target, action) {

    const wrapper = target.closest(".cart-item");
    const qtyInput = wrapper.querySelector(".qty-input");

    let qty = parseInt(qtyInput.value);

    if (action === "plus") qty++;
    if (action === "minus" && qty > 1) qty--;
    if (action === "input") {
        if (qty < 1 || isNaN(qty)) qty = 1;
    }

    qtyInput.value = qty;

    const unitPrice = parseFloat(wrapper.querySelector(".unit-price").value);
    const weightMult = parseFloat(wrapper.querySelector(".weight-mult").value);
    const isPerUnit = parseInt(wrapper.querySelector(".is-per-unit").value);

    let itemTotal = unitPrice * weightMult * qty;
    itemTotal = itemTotal.toFixed(2);

    // UPDATE RIGHT SIDE TOTAL
    wrapper.querySelector(".item-total span").innerText = itemTotal;

    // UPDATE LEFT PRICE (per 1 quantity)
    const leftPrice = wrapper.querySelector(".new-price");
    leftPrice.innerText = "₹" + (itemTotal / qty).toFixed(2);

    // -------------------------------
    // ✅ UPDATE "for WEIGHT × QTY"
    // -------------------------------
    const perUnitLabel = wrapper.querySelector(".cart-price-line .per-unit");

    if (perUnitLabel) {

        // Extract ONLY the first weight part (example: 250ML, 1KG, 500G)
        const weightElement = wrapper.querySelector(".cart-weight");
        let weightOnly = weightElement.childNodes[0].textContent.trim();

        perUnitLabel.innerText = `for ${weightOnly} × ${qty}`;
    }

    updateSummary();

    if (wrapper.dataset.id) {
        updateServer(wrapper.dataset.id, qty);
    } else {
        updateGuest(wrapper, qty);
    }
}

document.querySelectorAll(".cart-item").forEach(wrapper => {
    const qty = parseInt(wrapper.querySelector(".qty-input").value);
    const perUnitLabel = wrapper.querySelector(".cart-price-line .per-unit");

    if (perUnitLabel) {
        const weightText = wrapper.querySelector(".cart-weight").childNodes[0].textContent.trim();
        perUnitLabel.innerText = `for ${weightText} × ${qty}`;
    }
});

    function updateSummary() {
        let subtotal = 0;

        document.querySelectorAll(".item-total span").forEach(sp => {
            subtotal += parseFloat(sp.innerText);
        });

        const tax = subtotal * 0.05;
        const total = subtotal + tax;

        document.querySelector("#subtotal").innerText = subtotal.toFixed(2);
        document.querySelector("#tax").innerText = tax.toFixed(2);
        document.querySelector("#total").innerText = total.toFixed(2);
    }

    function updateServer(itemId, qty) {
        fetch("/cart/update/", {

            method: "POST",
            headers: {
                "X-CSRFToken": getCSRF(),
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `item_id=${itemId}&quantity=${qty}`
        });
    }

    function updateGuest(wrapper, qty) {
        const pid = wrapper.dataset.pid;
        const weight = wrapper.dataset.weight;

        fetch("/update-guest-cart-qty/", {
            method: "POST",
            headers: {
                "X-CSRFToken": getCSRF(),
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `product_id=${pid}&weight=${weight}&qty=${qty}`
        });
    }

    function getCSRF() {
        const cookie = document.cookie.split("; ").find(row => row.startsWith("csrftoken="));
        return cookie ? cookie.split("=")[1] : "";
    }
});
