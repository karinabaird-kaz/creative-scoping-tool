import { useState } from 'react';
import { packages } from './data/scopingData';
import type { Package } from './data/scopingData';
import { Landing } from './components/Landing';
import { Calculator } from './components/Calculator';

function App() {
  const [selected, setSelected] = useState<Package | null>(null);

  if (selected) {
    return <Calculator pkg={selected} onBack={() => setSelected(null)} />;
  }

  return <Landing packages={packages} onSelect={setSelected} />;
}

export default App;
