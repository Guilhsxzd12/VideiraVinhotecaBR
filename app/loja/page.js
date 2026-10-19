import LojaClient from './LojaClient';
import {getInitialProducts} from '../serverCatalog';
export default async function LojaPage(){const initialProducts=await getInitialProducts();return <LojaClient initialProducts={initialProducts}/>}
