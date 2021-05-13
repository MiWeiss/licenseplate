// clear expired cache on browser start
import {removeExpiredFromCache} from "./utils/cacheUtils";

removeExpiredFromCache().then(() => console.log("Cleared expired elements from cache"));