import { useState } from 'react';
import { ethers } from "ethers";

export default function InputBoxProp() {

    const [input, setInput] = useState();
    
    const handleChange = (event:any) => {
        //const valueToBn = ethers.utils.parseUnits(event.target.value, 0);
        //const result = event.target.value.replace(/\D/g, '');
        const result = event.target.value.replace(/[^0-9\.|\,]/g, '')
        //TODO: make 
        setInput(result);
        // console.log('value is:', result);
    };


    
    return (
        <div className="flex gap-x-2">
        <input
            className="bg-gray-800 text-white py-2 px-4 w-96"
            type="text"
            value={input}
            onChange={handleChange}
        />
         
        </div>
    )
}

