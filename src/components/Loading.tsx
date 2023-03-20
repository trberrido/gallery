import spinner from '../assets/spinner.svg';
import './Loading.css';

type LoadingProps = { percent: number };

const Loading = ({ percent }: LoadingProps) => {

	return (
		<div
			style={{ backgroundImage: `url(${spinner})` }}
			className='loading__background'>
				<p className='loading__percent'>{ Math.floor(percent) }%</p>
		</div>
	);
}

export default Loading;