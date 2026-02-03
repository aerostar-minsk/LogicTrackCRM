const DRIVE_CONFIG = {
  CLIENT_ID: "",
  API_KEY: "",
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

const getCustomsName = (code) => customsCodeMap[code] || "Введите правильный код";

const loadOrders = () => {
  const stored = localStorage.getItem("logictrack_orders");
  return stored ? JSON.parse(stored) : [];
};

const saveOrders = (orders) => {
  localStorage.setItem("logictrack_orders", JSON.stringify(orders));
};

const App = () => {
  const [orders, setOrders] = React.useState(loadOrders);
  const [driveConnected, setDriveConnected] = React.useState(false);
  const [driveHint, setDriveHint] = React.useState(
    "Чтобы активировать синхронизацию, укажите CLIENT_ID и API_KEY в app.jsx."
  );

  const [formData, setFormData] = React.useState({
    recipient: "",
    orderName: "",
    awb: "",
    quantity: "",
    weight: "",
    customsCode: "",
    notes: "",
  });

  React.useEffect(() => {
    saveOrders(orders);
  }, [orders]);

  const customsName = formData.customsCode
    ? getCustomsName(formData.customsCode.trim())
    : "Введите код таможни";

  const handleFieldChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "recipient") {
        next.orderName = value.trim();
      }
      return next;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const order = {
      id: `order-${Date.now()}`,
      name: formData.orderName.trim(),
      recipient: formData.recipient.trim(),
      awb: formData.awb.trim(),
      quantity: formData.quantity.trim(),
      weight: formData.weight.trim(),
      customsCode: formData.customsCode.trim(),
      customsName: getCustomsName(formData.customsCode.trim()),
      notes: formData.notes.trim(),
      driveFolder: null,
    };

    setOrders((prev) => [order, ...prev]);
    setFormData({
      recipient: "",
      orderName: "",
      awb: "",
      quantity: "",
      weight: "",
      customsCode: "",
      notes: "",
    });
  };

  const connectGoogleDrive = () => {
    if (!DRIVE_CONFIG.CLIENT_ID || !DRIVE_CONFIG.API_KEY) {
      setDriveHint("Нужны CLIENT_ID и API_KEY. Добавьте их в app.jsx для подключения.");
      return;
    }

    setDriveHint(
      "Конфигурация указана. Здесь подключите Google Identity Services для OAuth."
    );
    setDriveConnected(true);
  };

  const createDriveFolder = () => {
    if (!driveConnected) {
      setDriveHint("Сначала подключите Google Drive.");
      return;
    }
    if (orders.length === 0) {
      setDriveHint("Создайте заказ, чтобы создать папку.");
      return;
    }

    const latest = orders[0];
    const updated = [{ ...latest, driveFolder: `Drive/${latest.name}` }, ...orders.slice(1)];
    setOrders(updated);
    setDriveHint(`Папка создана: Drive/${latest.name}`);
  };

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <p className="app__eyebrow">Transport Logistics CRM</p>
          <h1>Контроль и сопровождение заказов</h1>
          <p className="app__subtitle">
            Первый этап: создание заказа, контроль данных, подготовка к синхронизации с Google Drive.
          </p>
        </div>
        <div className={`app__status ${driveConnected ? "app__status--connected" : ""}`}>
          Google Drive: {driveConnected ? "подключен" : "не подключен"}
        </div>
      </header>

      <main className="grid">
        <section className="card">
          <h2>Новый заказ</h2>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="recipient">Получатель груза *</label>
              <input
                id="recipient"
                name="recipient"
                type="text"
                placeholder="ООО Логистик Про"
                required
                value={formData.recipient}
                onChange={handleFieldChange("recipient")}
              />
            </div>
            <div className="field">
              <label htmlFor="orderName">Название заказа</label>
              <input id="orderName" name="orderName" type="text" readOnly value={formData.orderName} />
              <small>Автоматически формируется по получателю груза.</small>
            </div>
            <div className="field">
              <label htmlFor="awb">Номер авианакладной *</label>
              <input
                id="awb"
                name="awb"
                type="text"
                placeholder="123-45678901"
                required
                value={formData.awb}
                onChange={handleFieldChange("awb")}
              />
            </div>
            <div className="field">
              <label htmlFor="quantity">Количество (шт) *</label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                step="1"
                required
                value={formData.quantity}
                onChange={handleFieldChange("quantity")}
              />
            </div>
            <div className="field">
              <label htmlFor="weight">Вес (кг) *</label>
              <input
                id="weight"
                name="weight"
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.weight}
                onChange={handleFieldChange("weight")}
              />
            </div>
            <div className="field">
              <label htmlFor="customsCode">Код таможни назначения *</label>
              <input
                id="customsCode"
                name="customsCode"
                type="text"
                placeholder="06536"
                required
                value={formData.customsCode}
                onChange={handleFieldChange("customsCode")}
              />
              <small className="hint">{customsName}</small>
            </div>
            <div className="field">
              <label htmlFor="notes">Примечания</label>
              <textarea
                id="notes"
                name="notes"
                rows="4"
                placeholder="Дополнительные инструкции..."
                value={formData.notes}
                onChange={handleFieldChange("notes")}
              />
            </div>
            <button type="submit" className="primary">
              Создать заказ
            </button>
          </form>
        </section>

        <section className="card">
          <h2>Google Drive синхронизация</h2>
          <p>
            Секция готова к подключению Google Drive API. После настройки создается отдельная папка
            для документов заказа.
          </p>
          <div className="drive-actions">
            <button type="button" onClick={connectGoogleDrive}>
              Подключить Google Drive
            </button>
            <button type="button" className="primary" disabled={!driveConnected} onClick={createDriveFolder}>
              Создать папку для заказа
            </button>
          </div>
          <div className="drive-hint">{driveHint}</div>
        </section>
      </main>

      <section className="card">
        <h2>Реестр заказов</h2>
        <div className="table">
          <div className="table__row table__head">
            <span>Название</span>
            <span>Получатель</span>
            <span>Авианакладная</span>
            <span>Кол-во</span>
            <span>Вес</span>
            <span>Таможня</span>
            <span>Папка Drive</span>
          </div>
          <div className="table__body">
            {orders.length === 0 ? (
              <div className="table__empty">Пока нет созданных заказов.</div>
            ) : (
              orders.map((order) => (
                <div className="table__row" key={order.id}>
                  <span>{order.name}</span>
                  <span>{order.recipient}</span>
                  <span>{order.awb}</span>
                  <span>{order.quantity}</span>
                  <span>{order.weight}</span>
                  <span>{order.customsName}</span>
                  <span>{order.driveFolder || "—"}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
