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
        if (action === "input" && (qty < 1 || isNaN(qty))) qty = 1;

        qtyInput.value = qty;

        // 🔥 Correct price calculation
        const baseUnitPrice = parseFloat(wrapper.querySelector(".unit-price").value);
        const isPerUnit = wrapper.querySelector(".is-per-unit").value === "1";

        let converted = parseFloat(wrapper.querySelector(".weight-mult").value) || 1;
        let defaultW = parseFloat(wrapper.querySelector(".default-weight").value) || 1;

        let multiplier = 1;

        if (isPerUnit) {
            multiplier = converted / defaultW;
        }

        const actualSinglePrice = baseUnitPrice * multiplier;
        const itemTotal = (actualSinglePrice * qty).toFixed(2);

        wrapper.querySelector(".item-total span").innerText = itemTotal;

        // Update "for ___ × qty"
        const perUnitLabel = wrapper.querySelector(".cart-price-line .per-unit");
        if (perUnitLabel) {
            const weightOnly = wrapper.querySelector(".cart-weight").childNodes[0].textContent.trim();
            perUnitLabel.innerText = `for ${weightOnly} × ${qty}`;
        }

        updateSummary();

        // Server update
        if (wrapper.dataset.id) {
            updateServer(wrapper.dataset.id, qty);
        } else {
            updateGuest(wrapper, qty);
        }
    }

    // Set default "for ___ × qty"
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
            subtotal += parseFloat(sp.innerText) || 0;
        });

        const tax = subtotal * 0.05;
        const total = subtotal + tax;

        document.querySelector("#subtotal").innerText = subtotal.toFixed(2);
        document.querySelector("#tax").innerText = tax.toFixed(2);
        document.querySelector("#total").innerText = total.toFixed(2);
    }

    function updateServer(itemId, qty) {
        fetch(`/update-cart-qty/${itemId}/${qty}/`, {
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
