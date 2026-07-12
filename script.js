const activityMultipliers = {
  light: 0.12,
  moderate: 0.18,
  intense: 0.25,
};

const MAX_DAILY_TARGET_LITERS = 5;

const climateBonus = {
  mild: 0,
  warm: 0.35,
  hot: 0.65,
};

const stageBonus = {
  none: 0,
  pregnant: 0.3,
  breastfeeding: 0.7,
};

const state = {
  unit: "kg",
  intensity: "moderate",
};

const elements = {
  weight: document.querySelector("#weight"),
  minutes: document.querySelector("#minutes"),
  climate: document.querySelector("#climate"),
  stage: document.querySelector("#stage"),
  drinks: document.querySelector("#drinks"),
  liters: document.querySelector("#liters"),
  summary: document.querySelector("#summary"),
  base: document.querySelector("#base"),
  activity: document.querySelector("#activity"),
  extra: document.querySelector("#extra"),
};

function rounded(value, places = 1) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function activateButton(selector, attribute, value) {
  document.querySelectorAll(selector).forEach((button) => {
    const isActive = button.dataset[attribute] === value;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function calculate() {
  const rawWeight = Number(elements.weight.value);
  const minutes = Math.max(Number(elements.minutes.value) || 0, 0);
  const drinks = Math.max(Number(elements.drinks.value) || 0, 0);

  if (!rawWeight || rawWeight <= 0) {
    elements.weight.setAttribute("aria-invalid", "true");
    elements.liters.textContent = "--";
    elements.summary.textContent = "Add a valid weight to calculate your target.";
    elements.base.textContent = "--";
    elements.activity.textContent = "--";
    elements.extra.textContent = "--";
    return;
  }

  elements.weight.setAttribute("aria-invalid", "false");
  const weightKg = state.unit === "kg" ? rawWeight : rawWeight * 0.453592;
  const baseLiters = weightKg * 0.035;
  const activityLiters = (minutes / 30) * activityMultipliers[state.intensity];
  const extras =
    climateBonus[elements.climate.value] +
    stageBonus[elements.stage.value] +
    drinks * 0.12;
  const uncappedLiters = baseLiters + activityLiters + extras;
  const totalLiters = Math.min(
    Math.max(baseLiters + activityLiters + extras, 1.5),
    MAX_DAILY_TARGET_LITERS,
  );
  const variableLiters = activityLiters + extras;
  const cappedVariableLiters = Math.max(totalLiters - baseLiters, 0);
  const breakdownScale =
    uncappedLiters > totalLiters && variableLiters > 0
      ? cappedVariableLiters / variableLiters
      : 1;
  const displayedActivityLiters = activityLiters * breakdownScale;
  const displayedExtras = extras * breakdownScale;
  const cups = Math.round(totalLiters / 0.237);
  const ounces = Math.round(totalLiters * 33.814);

  elements.liters.textContent = rounded(totalLiters, 1).toFixed(1);
  elements.summary.textContent = `${cups} cups or about ${ounces} fl oz.`;
  elements.base.textContent = `${rounded(baseLiters, 1).toFixed(1)} L`;
  elements.activity.textContent = `${rounded(displayedActivityLiters, 1).toFixed(1)} L`;
  elements.extra.textContent = `${rounded(displayedExtras, 1).toFixed(1)} L`;
}

document.querySelectorAll("[data-unit]").forEach((button) => {
  button.addEventListener("click", () => {
    state.unit = button.dataset.unit;
    activateButton("[data-unit]", "unit", state.unit);
    calculate();
  });
});

document.querySelectorAll("[data-intensity]").forEach((button) => {
  button.addEventListener("click", () => {
    state.intensity = button.dataset.intensity;
    activateButton("[data-intensity]", "intensity", state.intensity);
    calculate();
  });
});

Object.values(elements).forEach((element) => {
  if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) {
    element.addEventListener("input", calculate);
  }
});

calculate();
