import WineDetail from '../../WineDetail';
import {getInitialProducts} from '../../serverCatalog';
export default async function WinePage({params}){const {id}=await params;const marker=id.lastIndexOf('--');return <WineDetail id={marker>=0?id.slice(marker+2):id} initialProducts={await getInitialProducts()}/>}
