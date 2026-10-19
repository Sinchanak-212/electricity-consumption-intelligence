import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>Overview</NavLink>
      <NavLink to="/peak" className={({ isActive }) => (isActive ? 'active' : '')}>Peak Intelligence</NavLink>
      <NavLink to="/behaviour" className={({ isActive }) => (isActive ? 'active' : '')}>Consumption Behaviour</NavLink>
      <NavLink to="/forecast" className={({ isActive }) => (isActive ? 'active' : '')}>Forecasting &amp; Simulation</NavLink>
      <NavLink to="/processing" className={({ isActive }) => (isActive ? 'active' : '')}>Data &amp; Processing</NavLink>
    </nav>
  );
}
