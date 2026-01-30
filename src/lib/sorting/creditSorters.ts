/**
 * Sorting algorithms for carbon credit listings
 * Implements various sorting techniques to enhance performance
 */

// Define the shape of a carbon credit listing
interface CreditListing {
  id: string;
  price: number;
  quality: number; // Quality rating (1-10)
  quantity: number;
  seller: string;
  region: string;
  certification: string;
  verified: boolean;
  createdAt: Date;
}

// Bubble sort implementation (simple but inefficient for large datasets)
const bubbleSort = (listings: CreditListing[], key: keyof CreditListing): CreditListing[] => {
  const sorted = [...listings];
  const n = sorted.length;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (sorted[j][key] > sorted[j + 1][key]) {
        [sorted[j], sorted[j + 1]] = [sorted[j + 1], sorted[j]];
      }
    }
  }

  return sorted;
};

// Quick sort implementation (efficient for large datasets)
const quickSort = (
  listings: CreditListing[],
  key: keyof CreditListing,
  ascending: boolean = true
): CreditListing[] => {
  if (listings.length <= 1) {
    return listings;
  }

  const pivot = listings[listings.length - 1];
  const left: CreditListing[] = [];
  const right: CreditListing[] = [];

  for (let i = 0; i < listings.length - 1; i++) {
    const listing = listings[i];
    const compareResult = ascending 
      ? listing[key] < pivot[key] 
      : listing[key] > pivot[key];
    
    if (compareResult) {
      left.push(listing);
    } else {
      right.push(listing);
    }
  }

  return [...quickSort(left, key, ascending), pivot, ...quickSort(right, key, ascending)];
};

// Merge sort implementation (stable and efficient)
const mergeSort = (
  listings: CreditListing[],
  key: keyof CreditListing,
  ascending: boolean = true
): CreditListing[] => {
  if (listings.length <= 1) {
    return listings;
  }

  const mid = Math.floor(listings.length / 2);
  const left = mergeSort(listings.slice(0, mid), key, ascending);
  const right = mergeSort(listings.slice(mid), key, ascending);

  return merge(left, right, key, ascending);
};

const merge = (
  left: CreditListing[],
  right: CreditListing[],
  key: keyof CreditListing,
  ascending: boolean
): CreditListing[] => {
  const result: CreditListing[] = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    const compareResult = ascending 
      ? left[leftIndex][key] < right[rightIndex][key] 
      : left[leftIndex][key] > right[rightIndex][key];
    
    if (compareResult) {
      result.push(left[leftIndex]);
      leftIndex++;
    } else {
      result.push(right[rightIndex]);
      rightIndex++;
    }
  }

  return [...result, ...left.slice(leftIndex), ...right.slice(rightIndex)];
};

// Radix sort for numeric values
const radixSort = (listings: CreditListing[], key: keyof CreditListing): CreditListing[] => {
  const sorted = [...listings];
  
  // Find maximum value for digit extraction
  const maxValue = Math.max(...sorted.map(listing => {
    const value = listing[key];
    return typeof value === 'number' ? value : 0;
  }));

  // Perform radix sort
  let place = 1;
  while (maxValue / place > 0) {
    sorted.sort((a, b) => {
      const valueA = typeof a[key] === 'number' ? Math.floor(a[key] / place) % 10 : 0;
      const valueB = typeof b[key] === 'number' ? Math.floor(b[key] / place) % 10 : 0;
      return valueA - valueB;
    });
    place *= 10;
  }

  return sorted;
};

// Custom comparator for multi-key sorting
const multiKeyComparator = (
  keys: Array<{ key: keyof CreditListing; ascending: boolean }>
): ((a: CreditListing, b: CreditListing) => number) => {
  return (a, b) => {
    for (let i = 0; i < keys.length; i++) {
      const { key, ascending } = keys[i];
      
      if (a[key] < b[key]) {
        return ascending ? -1 : 1;
      }
      
      if (a[key] > b[key]) {
        return ascending ? 1 : -1;
      }
    }
    
    return 0;
  };
};

// Performance measurement utility
const measurePerformance = (
  sortFunction: (listings: CreditListing[], key: keyof CreditListing) => CreditListing[],
  listings: CreditListing[],
  key: keyof CreditListing
): {
  sortedListings: CreditListing[];
  time: number;
  comparisons: number;
} => {
  const startTime = performance.now();
  let comparisons = 0;

  // Modify listings to count comparisons
  const trackedListings = listings.map(listing => {
    return new Proxy(listing, {
      get(target, prop) {
        if (prop === key) {
          comparisons++;
        }
        return target[prop];
      }
    });
  });

  const sorted = sortFunction(trackedListings as unknown as CreditListing[], key);
  const endTime = performance.now();

  return {
    sortedListings: sorted,
    time: endTime - startTime,
    comparisons
  };
};

// Factory function to select appropriate sorting algorithm based on data size
const selectSortingAlgorithm = (listings: CreditListing[]): ((
  listings: CreditListing[],
  key: keyof CreditListing,
  ascending?: boolean
) => CreditListing[]) => {
  if (listings.length <= 10) {
    return bubbleSort;
  } else if (listings.length <= 1000) {
    return quickSort;
  } else {
    return radixSort;
  }
};

// Main sorting function
const sortCreditListingsInternal = (
  listings: CreditListing[],
  sortKey: keyof CreditListing,
  ascending: boolean = true
): CreditListing[] => {
  // Validate inputs
  if (!Array.isArray(listings)) {
    throw new Error('Input must be an array');
  }

  // Select appropriate algorithm
  const sortAlgorithm = selectSortingAlgorithm(listings);
  
  // Sort using selected algorithm
  return sortAlgorithm(listings, sortKey, ascending);
};

// Example usage
const exampleUsage = () => {
  // Sample data
  const sampleListings: CreditListing[] = [
    {
      id: '1',
      price: 25,
      quality: 8,
      quantity: 100,
      seller: 'Seller A',
      region: 'North America',
      certification: 'Verified',
      verified: true,
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      price: 20,
      quality: 6,
      quantity: 50,
      seller: 'Seller B',
      region: 'Europe',
      certification: 'Standard',
      verified: true,
      createdAt: new Date('2024-01-02')
    },
    {
      id: '3',
      price: 30,
      quality: 9,
      quantity: 200,
      seller: 'Seller C',
      region: 'Asia',
      certification: 'Premium',
      verified: false,
      createdAt: new Date('2024-01-03')
    },
    {
      id: '4',
      price: 15,
      quality: 5,
      quantity: 300,
      seller: 'Seller D',
      region: 'South America',
      certification: 'Basic',
      verified: true,
      createdAt: new Date('2024-01-04')
    }
  ];

  // Sort by price ascending
  const sortedByPrice = sortCreditListingsInternal(sampleListings, 'price', true);
  console.log('Sorted by Price (Ascending):', sortedByPrice.map(listing => ({ id: listing.id, price: listing.price })));

  // Sort by quality descending
  const sortedByQuality = sortCreditListingsInternal(sampleListings, 'quality', false);
  console.log('Sorted by Quality (Descending):', sortedByQuality.map(listing => ({ id: listing.id, quality: listing.quality })));

  // Sort by quantity and then price
  const sortedByQuantityAndPrice = sortCreditListingsInternal(
    sampleListings,
    multiKeyComparator([
      { key: 'quantity', ascending: false },
      { key: 'price', ascending: true }
    ]) as unknown as keyof CreditListing,
    true
  );
  console.log('Sorted by Quantity and Price:', sortedByQuantityAndPrice.map(listing => ({ id: listing.id, quantity: listing.quantity, price: listing.price })));

  return {
    sortedByPrice,
    sortedByQuality,
    sortedByQuantityAndPrice
  };
};

export {
  bubbleSort,
  quickSort,
  mergeSort,
  radixSort,
  multiKeyComparator,
  measurePerformance,
  selectSortingAlgorithm,
  sortCreditListingsInternal as sortCreditListings
};

export default sortCreditListingsInternal;