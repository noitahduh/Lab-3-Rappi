export const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: #f5f4f0;
    color: #1a1a1a;
  }

  /* HEADER */
  .app-header {
    background: #1a1a1a;
    color: #f5f4f0;
    padding: 18px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  .app-header h1 { font-size: 20px; font-weight: 600; letter-spacing: -0.3px; }
  .app-header .user-tag {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    opacity: 0.45;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  /* LAYOUT */
  .app-body {
    display: grid;
    grid-template-columns: 260px 1fr;
    min-height: calc(100vh - 57px);
  }

  .app-sidebar {
    background: #fff;
    border-right: 1px solid #e8e6e0;
    padding: 24px 0;
    overflow-y: auto;
  }

  .sidebar-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #bbb;
    padding: 0 20px 10px;
  }

  .sidebar-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 13px 20px;
    cursor: pointer;
    border-left: 3px solid transparent;
    transition: all 0.12s ease;
    font-size: 14px;
    font-weight: 500;
    color: #444;
  }
  .sidebar-item:hover { background: #f5f4f0; color: #1a1a1a; }
  .sidebar-item.active { background: #f5f4f0; border-left-color: #1a1a1a; color: #1a1a1a; }

  .status-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .status-dot.green { background: #22c55e; }
  .status-dot.gray  { background: #d1d5db; }
  .status-dot.yellow { background: #f59e0b; }

  .app-main { padding: 28px 32px; display: flex; flex-direction: column; gap: 24px; }

  /* CARDS */
  .card {
    background: #fff;
    border-radius: 12px;
    border: 1px solid #e8e6e0;
    overflow: hidden;
  }
  .card-header {
    padding: 16px 20px;
    border-bottom: 1px solid #e8e6e0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .card-title { font-size: 14px; font-weight: 600; }
  .card-meta { font-size: 12px; color: #999; }

  /* EMPTY STATE */
  .empty {
    padding: 36px 20px;
    text-align: center;
    color: #bbb;
    font-size: 13px;
  }

  /* GRID */
  .grid-mosaic {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1px;
    background: #e8e6e0;
  }
  .grid-tile {
    background: #fff;
    padding: 16px;
    cursor: pointer;
    transition: background 0.1s;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .grid-tile:hover { background: #fafaf8; }
  .tile-emoji { font-size: 26px; margin-bottom: 4px; }
  .tile-name { font-size: 13px; font-weight: 500; }
  .tile-sub { font-family: 'DM Mono', monospace; font-size: 12px; color: #888; }

  /* LIST ROWS */
  .list-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid #f0ede8;
    font-size: 14px;
  }
  .list-row:last-child { border-bottom: none; }
  .row-title { font-weight: 500; }
  .row-sub { font-family: 'DM Mono', monospace; font-size: 11px; color: #bbb; margin-top: 2px; }

  /* BADGES */
  .badge {
    font-size: 11px;
    font-weight: 500;
    padding: 4px 10px;
    border-radius: 20px;
    text-transform: capitalize;
    white-space: nowrap;
  }
  .badge.pending  { background: #fef9c3; color: #854d0e; }
  .badge.accepted { background: #dcfce7; color: #166534; }
  .badge.delivered{ background: #e0f2fe; color: #075985; }
  .badge.open     { background: #dcfce7; color: #166534; }
  .badge.closed   { background: #f1f5f9; color: #64748b; }

  /* BUTTONS */
  .btn {
    border: none;
    border-radius: 8px;
    padding: 9px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.1s;
  }
  .btn:hover { opacity: 0.85; }
  .btn:active { transform: scale(0.98); }
  .btn:disabled { opacity: 0.3; cursor: not-allowed; }

  .btn-dark { background: #1a1a1a; color: #fff; }
  .btn-outline { background: none; border: 1px solid #e8e6e0; color: #555; }
  .btn-outline:hover { border-color: #1a1a1a; color: #1a1a1a; opacity: 1; }
  .btn-green { background: #22c55e; color: #fff; }
  .btn-red { background: #ef4444; color: #fff; }
  .btn-full { width: 100%; border-radius: 0; padding: 14px; font-size: 14px; }

  /* FORM */
  .form-wrap { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
  .form-input {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #e8e6e0;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color 0.15s;
    background: #fafaf8;
  }
  .form-input:focus { border-color: #1a1a1a; background: #fff; }
  .form-select {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #e8e6e0;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    background: #fafaf8;
    outline: none;
    cursor: pointer;
  }
  .form-label { font-size: 12px; font-weight: 600; color: #666; }

  /* AUTH PAGES */
  .auth-page {
    min-height: 100vh;
    background: #f5f4f0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .auth-box {
    background: #fff;
    border: 1px solid #e8e6e0;
    border-radius: 16px;
    padding: 40px;
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .auth-logo { font-size: 32px; text-align: center; }
  .auth-title { font-size: 22px; font-weight: 600; text-align: center; letter-spacing: -0.3px; }
  .auth-sub { font-size: 13px; color: #999; text-align: center; }
  .auth-link {
    font-size: 13px;
    color: #1a1a1a;
    text-align: center;
    text-decoration: none;
    font-weight: 500;
    cursor: pointer;
  }
  .auth-link:hover { text-decoration: underline; }
  .auth-divider { border: none; border-top: 1px solid #e8e6e0; }

  /* TOGGLE SWITCH */
  .toggle-wrap { display: flex; align-items: center; gap: 10px; padding: 16px 20px; }
  .toggle {
    position: relative;
    width: 44px; height: 24px;
    background: #e5e7eb;
    border-radius: 999px;
    cursor: pointer;
    transition: background 0.2s;
    flex-shrink: 0;
    border: none;
    outline: none;
  }
  .toggle.on { background: #22c55e; }
  .toggle::after {
    content: '';
    position: absolute;
    width: 18px; height: 18px;
    background: #fff;
    border-radius: 50%;
    top: 3px; left: 3px;
    transition: transform 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
  .toggle.on::after { transform: translateX(20px); }
  .toggle-label { font-size: 14px; font-weight: 500; }
`