import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Field from '../components/ui/Field';
import PageHeader from '../components/ui/PageHeader';

function ConsumptionForm() {
  const [kitchenId, setKitchenId] = useState('kitchen-nyc-001');
  const [dishId, setDishId] = useState('');
  const [cooked, setCooked] = useState('');
  const [consumed, setConsumed] = useState('');
  const [date, setDate] = useState('');
  const [dishes, setDishes] = useState([]);
  const [logs, setLogs] = useState([]);

  const load = async () => {
    const [dishRes, logRes] = await Promise.all([
      api.get('/menu', { params: { kitchenId } }),
      api.get('/consumption', { params: { kitchenId } })
    ]);
    setDishes(dishRes.data.data || []);
    setLogs(logRes.data.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const submitLog = async (e) => {
    e.preventDefault();
    await api.post('/consumption', {
      kitchenId,
      dishId,
      cooked: Number(cooked),
      consumed: Number(consumed),
      date
    });
    setCooked('');
    setConsumed('');
    setDate('');
    load();
  };

  return (
    <div className="stack">
      <PageHeader
        eyebrow="Daily Discipline"
        title="Daily Consumption Entry"
        description="Capture cooked versus consumed quantities every day to identify preventable leftovers early."
      />
      <Card toned title="Log Consumption">
        <form className="form-grid" onSubmit={submitLog}>
          <Field label="Kitchen ID" htmlFor="consumption-kitchen-id">
            <input id="consumption-kitchen-id" value={kitchenId} onChange={(e) => setKitchenId(e.target.value)} placeholder="Kitchen ID" />
          </Field>
          <Field label="Dish" htmlFor="dish-selector">
            <select id="dish-selector" value={dishId} onChange={(e) => setDishId(e.target.value)}>
              <option value="">Select Dish</option>
              {dishes.map((dish) => (
                <option key={dish._id} value={dish._id}>{dish.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Cooked amount" htmlFor="cooked-amount">
            <input id="cooked-amount" type="number" value={cooked} onChange={(e) => setCooked(e.target.value)} placeholder="Cooked" />
          </Field>
          <Field label="Consumed amount" htmlFor="consumed-amount">
            <input id="consumed-amount" type="number" value={consumed} onChange={(e) => setConsumed(e.target.value)} placeholder="Consumed" />
          </Field>
          <Field label="Date" htmlFor="consumption-date">
            <input id="consumption-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <div className="form-action">
            <Button id="save-log-action" type="submit">Save Log</Button>
          </div>
        </form>
      </Card>

      <Card title="Recent Logs">
        {logs.length === 0 && <p className="empty-state">No consumption logs yet for this kitchen.</p>}
        {logs.map((log) => (
          <div className="row" key={log._id}>
            <strong>{log.dishId?.name || 'Dish'}</strong>
            <span>Cooked: {log.cooked} | Consumed: {log.consumed}</span>
            <Badge tone={Number(log.leftover) > 0 ? 'warning' : 'success'}>Leftover: {log.leftover}</Badge>
          </div>
        ))}
      </Card>
    </div>
  );
}

export default ConsumptionForm;
