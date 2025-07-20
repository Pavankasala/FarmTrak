import React, { useState, useEffect } from 'react';
import './App.css';

function Dashboard({ stats }) {
  return (
    <div className="dashboard">
      <div className="stat-card">
        <h3>Total Eggs</h3>
        <p>{stats.total_eggs}</p>
      </div>
      <div className="stat-card">
        <h3>Eggs Sold</h3>
        <p>{stats.total_sold}</p>
      </div>
      <div className="stat-card">
        <h3>In Stock</h3>
        <p>{stats.in_stock}</p>
      </div>
    </div>
  );
}

function EggTable({ batches }) {
  return (
    <table className="egg-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Quantity</th>
          <th>Grade</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {batches.map((batch) => (
          <tr key={batch.id}>
            <td>{batch.date}</td>
            <td>{batch.quantity}</td>
            <td>{batch.grade}</td>
            <td>
              {batch.sold ? 
                <span className="status-sold">Sold</span> : 
                <span className="status-instock">In Stock</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function App() {
  const [data, setData] = useState({ egg_batches: [], total_eggs: 0, total_sold: 0, in_stock: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // IMPORTANT: Replace this URL with your own live backend URL from Render
    fetch('https://egg-api-pavankasala.onrender.com/api/eggs')
      .then(response => response.json())
      .then(fetchedData => {
        setData(fetchedData);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="App">
      <header className="app-header">
        <h1>Egg Production Dashboard</h1>
        <p>A Full-Stack Management Tool</p>
      </header>

      {loading ? (
        <p>Loading data from server...</p>
      ) : (
        <>
          <Dashboard stats={{ total_eggs: data.total_eggs, total_sold: data.total_sold, in_stock: data.in_stock }} />
          <EggTable batches={data.egg_batches} />
        </>
      )}
    </div>
  );
}

export default App;
