import { useCurrentConfigurationContext } from '../context'
import Image from './Image'
import './Configuration.css'

type ConfigurationProps = {
	images: string[],
	index: number
}


const Configuration = ({images, index}: ConfigurationProps) => {

	const display = index === useCurrentConfigurationContext();

	return (
		<div className={'configuration configuration' + (display ? '--visible' : '--hidden')}>
		{
			images.map((image) => (
				<Image key={image} src={image} />
			))

		}
		</div>
	);
}

export default Configuration;