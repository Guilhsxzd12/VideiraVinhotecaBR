import WineDetail from '../WineDetail';
import {getInitialProducts} from '../serverCatalog';
export default async function SlugPage({params}){const {slug}=await params;const initialProducts=await getInitialProducts();return <WineDetail slug={String(slug||'')} initialProducts={initialProducts}/>}
