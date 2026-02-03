const DRIVE_CONFIG = {
  CLIENT_ID: "",
  API_KEY: "",
};

const recipientInput = document.getElementById("recipient");
const orderNameInput = document.getElementById("orderName");
const customsCodeInput = document.getElementById("customsCode");
const customsNameEl = document.getElementById("customsName");
const orderForm = document.getElementById("orderForm");
const ordersList = document.getElementById("ordersList");
const driveStatus = document.getElementById("driveStatus");
const connectDriveButton = document.getElementById("connectDrive");
const createFolderButton = document.getElementById("createFolder");
const driveHint = document.getElementById("driveHint");

const state = {
  orders: [],
  driveConnected: false,
};

const customsCodeMap = {
  "06536": "ПТО Аэропорт Минск",
  "06533": "ПТО Минск-СЭЗ",
  "06529": "ПТО Колядичи-авто",
  "06611": "ПТО Белкульторг",
  "06650": "ПТО Минск-ТЛЦ-2",
  "06649": "ПТО Минск-ТЛЦ-1",
  "06544": "ПТО Белювелирторг",
  "06641": "ПТО Солигорск",
  "06651": "ПТО Великий Камень",
  "06613": "ПТО Жодино-Логистик",
  "06608": "ПТО Борисов-авто",
  "07242": "ПТО Полоцк-стекловолокно",
  "07260": "ПТО Витебск-Белтаможсервис",
  "07270": "ПТО Орша-Белтаможсервис",
  "07271": "ПТО Орша-ТЛЦ",
  "09146": "ПТО Барановичи-Фестивальная",
  "09159": "ПТО Брест-Белтаможсервис",
  "09161": "ПТО Пинск-Белтаможсервис",
  "09162": "ПТО Брест-Белтаможсервис-2",
  "14325": "ПТО Гомель-Белтаможсервис",
  "14336": "ПТО Жлобин-металлургический",
  "14354": "ПТО Гомель-СЭЗ",
  "09157": "ПТО Мозырь-Белтаможсервис",
  "16443": "ПТО Лида-авто",
  "16457": "ПТО Гродно-ГАП-2",
  "16463": "ПТО Брузги-ТЛЦ",
  "16464": "ПТО Каменный Лог-Белтаможсервис",
  "16465": "ПТО Берестовица-ТЛЦ",
  "20733": "ПТО Могилев-Белтаможсервис",
  "20734": "ПТО Бобруйск-Белтаможсервис",
};

const loadOrders = () => {
  const stored = localStorage.getItem("logictrack_orders");
  state.orders = stored ? JSON.parse(stored) : [];
};

const saveOrders = () => {
  localStorage.setItem("logictrack_orders", JSON.stringify(state.orders));
};

const getCustomsName = (code) => {
  return customsCodeMap[code] || "Введите правильный код";
};

const renderOrders = () => {
  ordersList.innerHTML = "";
  if (state.orders.length === 0) {
    const empty = document.createElement("div");
    empty.className = "table__empty";
    empty.textContent = "Пока нет созданных заказов.";
    ordersList.appendChild(empty);
    return;
  }

  state.orders.forEach((order) => {
    const row = document.createElement("div");
    row.className = "table__row";
    row.innerHTML = `
      <span>${order.name}</span>
      <span>${order.recipient}</span>
      <span>${order.awb}</span>
      <span>${order.quantity}</span>
      <span>${order.weight}</span>
      <span>${order.customsName}</span>
      <span>${order.driveFolder || "—"}</span>
    `;
    ordersList.appendChild(row);
  });
};

const updateCustomsHint = () => {
  const code = customsCodeInput.value.trim();
  if (!code) {
    customsNameEl.textContent = "Введите код таможни";
    return;
  }
  customsNameEl.textContent = getCustomsName(code);
};

const updateDriveState = () => {
  if (state.driveConnected) {
    driveStatus.textContent = "Google Drive: подключен";
    driveStatus.style.background = "#dcfce7";
    driveStatus.style.color = "#166534";
    createFolderButton.disabled = false;
    driveHint.textContent = "Теперь можно создавать папки для каждого заказа.";
  } else {
    driveStatus.textContent = "Google Drive: не подключен";
    driveStatus.style.background = "#e0f2fe";
    driveStatus.style.color = "#075985";
    createFolderButton.disabled = true;
  }
};

const connectGoogleDrive = async () => {
  if (!DRIVE_CONFIG.CLIENT_ID || !DRIVE_CONFIG.API_KEY) {
    driveHint.textContent =
      "Нужны CLIENT_ID и API_KEY. Добавьте их в app.js для подключения.";
    return;
  }

  driveHint.textContent =
    "Конфигурация указана. Здесь подключите Google Identity Services для OAuth.";
  state.driveConnected = true;
  updateDriveState();
};

const createDriveFolder = async () => {
  if (!state.driveConnected) {
    driveHint.textContent = "Сначала подключите Google Drive.";
    return;
  }
  const latestOrder = state.orders[state.orders.length - 1];
  if (!latestOrder) {
    driveHint.textContent = "Создайте заказ, чтобы создать папку.";
    return;
  }

  latestOrder.driveFolder = `Drive/${latestOrder.name}`;
  saveOrders();
  renderOrders();
  driveHint.textContent = `Папка создана: ${latestOrder.driveFolder}`;
};

recipientInput.addEventListener("input", (event) => {
  orderNameInput.value = event.target.value.trim();
});

customsCodeInput.addEventListener("input", updateCustomsHint);

orderForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const recipient = recipientInput.value.trim();
  const orderName = orderNameInput.value.trim();
  const awb = document.getElementById("awb").value.trim();
  const quantity = document.getElementById("quantity").value.trim();
  const weight = document.getElementById("weight").value.trim();
  const customsCode = customsCodeInput.value.trim();
  const customsName = getCustomsName(customsCode);
  const notes = document.getElementById("notes").value.trim();

  const order = {
    id: `order-${Date.now()}`,
    name: orderName,
    recipient,
    awb,
    quantity,
    weight,
    customsCode,
    customsName,
    notes,
    driveFolder: null,
  };

  state.orders.unshift(order);
  saveOrders();
  renderOrders();
  orderForm.reset();
  orderNameInput.value = "";
  customsNameEl.textContent = "Введите код таможни";
});

connectDriveButton.addEventListener("click", connectGoogleDrive);
createFolderButton.addEventListener("click", createDriveFolder);

loadOrders();
updateDriveState();
renderOrders();
