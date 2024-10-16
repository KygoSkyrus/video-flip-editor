import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/16/solid';
import './App.css';
import './VideoCropper.css';
import AutoFlip from './AutoFlip';
import DynamicFlip from './DynamicFlip';

function App() {

  const [autoFlip, setAutoFlip] = useState(false); // Flip Switch

  return (
    <div className="App bg-[#37393f]">
      <div className='bg-[#37393f] min-h-screen flex flex-col justify-between'>

        {/* Header */}
        <div className='flex justify-between items-center p-4 px-8 pb-0'>
          <section className='font-bold'>{autoFlip? 'AutoFlip': 'Dynamic'} Flip</section>

          <section>
            <label htmlFor="filter" className="switch" aria-label="Toggle Filter">
              <input type="checkbox" id="filter" checked={!autoFlip} onChange={(e) => setAutoFlip(e.target.checked)} />
              <span onClick={() => setAutoFlip(true)} >Auto Flip</span>
              <span onClick={(() => setAutoFlip(false))} className="flex aitems-center">Dynamic Flip
              </span>
            </label>
          </section>

          <section>
            <XMarkIcon className='size-6 font-thin text-gray-500' />
          </section>
        </div>

        {autoFlip ?
          <AutoFlip /> :
          <DynamicFlip />
        }
      </div>
    </div>
  );
}

export default App;