document.addEventListener("DOMContentLoaded", () => {
  const weightSelector = document.getElementById("weightSelector");
  const weightDropdown = document.getElementById("weightDropdown");
  const selectedWeightText = document.getElementById("selectedWeightText");
  const selectedWeightSelect = document.getElementById("selectedWeight");
  const qtyInput = document.getElementById("quantityInput");
  const livePrice = document.getElementById("livePrice");
  const mrpText = document.getElementById("mrpText");
  const savingsText = document.getElementById("savingsText");

  const basePrice = parseFloat(document.getElementById("basePrice").value);
  const discountPrice = parseFloat(document.getElementById("discountPrice").value);
  const productUnit = document.getElementById("productUnit").value.toLowerCase();
  const isOfferActive = document.getElementById("isOfferActive").value === "True";
  const defaultWeight = parseFloat(document.getElementById("defaultWeightVal").value);

  const perUnitTypes = ["kg", "litre"];
  const isPerUnit = perUnitTypes.includes(productUnit);

  function parseNumber(v) {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  }

  function computeFinal(unit_price, selectedVal, qty) {
    if (isPerUnit) {
      return unit_price * selectedVal * qty;
    } else {
      return unit_price * (selectedVal / defaultWeight) * qty;
    }
  }

  function updatePriceUI() {
    const selectedLabel = selectedWeightText.innerText.trim();
    const li = weightDropdown.querySelector(`li[data-value="${selectedLabel}"]`);
    if (!li) return;

    const selectedVal = parseNumber(li.getAttribute("data-val-num"));
    const qty = Math.max(1, parseInt(qtyInput.value) || 1);
    const unit_price = isOfferActive ? discountPrice : basePrice;

    const final = computeFinal(unit_price, selectedVal, qty);
    livePrice.innerText = "₹" + final.toFixed(2);

 const liveInfo = document.getElementById("livePriceInfo");
const liveUnit = document.getElementById("livePriceUnit");

if (liveInfo && liveUnit) {

    // Show: 2 × 250ML
    liveInfo.innerText = `${qty} × ${selectedLabel}`;

    const perUnitPrice = final / qty;

    let perText = "";

    if (isPerUnit) {
        perText = `₹${perUnitPrice.toFixed(2)} per ${selectedVal}${productUnit.toUpperCase()}`;
    } else {
        perText = `₹${perUnitPrice.toFixed(2)} per ${selectedLabel}`;
    }

    liveUnit.innerText = perText;
}
    if (isOfferActive) {
        const savePerUnit = basePrice - discountPrice;
        const saveTotal = computeFinal(savePerUnit, selectedVal, qty);
        const percent = Math.round((savePerUnit / basePrice) * 100);

        savingsText.innerText = `You save ₹${saveTotal.toFixed(2)} (${percent}% OFF)`;
        savingsText.classList.remove("d-none");
    } else {
        savingsText.classList.add("d-none");
    }
}

  weightSelector.addEventListener("click", (e) => {
    e.stopPropagation();
    weightDropdown.classList.toggle("d-none");
  });

  document.addEventListener("click", () => weightDropdown.classList.add("d-none"));

  weightDropdown.querySelectorAll("li").forEach(li => {
    li.addEventListener("click", () => {
      const label = li.getAttribute("data-value");
      selectedWeightText.innerText = label;
      selectedWeightSelect.value = label;
      weightDropdown.classList.add("d-none");
      updatePriceUI();
    });
  });

  document.querySelectorAll(".qty-btn.plus").forEach(btn => {
    btn.addEventListener("click", () => {
      qtyInput.value = Math.max(1, (parseInt(qtyInput.value) || 1) + 1);
      updatePriceUI();
    });
  });

  document.querySelectorAll(".qty-btn.minus").forEach(btn => {
    btn.addEventListener("click", () => {
      if (parseInt(qtyInput.value) > 1) {
        qtyInput.value = parseInt(qtyInput.value) - 1;
        updatePriceUI();
      }
    });
  });

  qtyInput.addEventListener("input", () => {
    if (parseInt(qtyInput.value) < 1) qtyInput.value = 1;
    updatePriceUI();
  });

  updatePriceUI();
});
