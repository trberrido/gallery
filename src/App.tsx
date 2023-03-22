import { useEffect } from 'react';
import Configuration from './components/Configuration';
import Loading from './components/Loading'

import { useGlobalContext } from './Context';

function App() {

	const {globalState, globalDispatch} = useGlobalContext();
	const percent = globalState.total > 0 ? globalState.loaded * 100 / globalState.total : 0;

	useEffect(() => {
		if (globalState.loaded === globalState.total){
			globalDispatch({
				type: 'update',
				payload: {
					mode: 'open'
				}
			})
		}
	}, [globalState.loaded, globalState.total])

	return (
		<>
		{
			(globalState.mode === 'closed') && <Loading percent={percent} />
		}
		{
			globalState.configurations && globalState.configurations?.map((images:string[], index) => (
				<Configuration
					index={index}
					images={images}
					key={index} />
			))
		}
		</>
	);

}

export default App;
