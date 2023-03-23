import { useEffect, memo } from 'react';
import Configuration from './components/Configuration';
import Loading from './components/Loading'

import { useGlobalContext, FetchedData } from './Context';

const App = memo(() => {

	const {globalState, globalDispatch} = useGlobalContext();
	const isCompletelyLoaded = globalState.total === globalState.loaded;
	const percent = globalState.total > 0 ? globalState.loaded * 100 / globalState.total : 0;

	useEffect(() => {
		if (globalState.loaded === globalState.total){
			globalDispatch({
				type: 'update',
				payload: {
					status: 'open'
				}
			})
		}
	// eslint-disable-next-line
	}, [globalState.loaded])

	return (
		<>
		{
			globalState.status === 'closed'
			&& isCompletelyLoaded === false
			&& <Loading percent={percent} />
		}
		{
			globalState.configurations && globalState.configurations.map((data:FetchedData, index) => (
				<Configuration
					index={index}
					images={data.images}
					key={data.id} />
			))
		}
		{
			globalState.status === 'closed'
			&& isCompletelyLoaded
			&& <div className='layout-black animation--fadein' />
		}
		</>
	);

})

export default App;
