import Configuration from './components/Configuration';
import Loading from './components/Loading'
import { useDataContext } from './context';
import { useMemo } from 'react';

type ConfigurationState = string[];

function App() {

	const data = useDataContext().data;
	const totalImages = useMemo(() => {
		return data.configurations ? data.configurations!.reduce((accumulator, configuration) => accumulator + configuration.length, 0) : 1
	}, [data.configurations])
	const percent = data.loadedImages * 100 / totalImages;

	return (
		<>
		{
			(data.loadedImages !== totalImages) && <Loading percent={ percent } />
		}
		{
			data.isLoaded && data.configurations!.map((configuration:ConfigurationState, index:number) => (
				<Configuration
					index={ index }
					images={ configuration }
					key={ index.toString() } />
				))
		}
		</>
	);

}

export default App;
