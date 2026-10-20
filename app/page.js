import HomeClient from './EditorialHome';
import {getInitialProducts} from './serverCatalog';
export default async function Page(){const initialProducts=await getInitialProducts();return <HomeClient initialProducts={initialProducts}/>}
