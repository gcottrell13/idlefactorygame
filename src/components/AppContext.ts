import { createContext } from 'react';
import type { useCalculateRates } from '../hooks/useCalculateRates';
import { Items } from '../content/itemNames';
import Decimal from 'decimal.js';

interface ContextProps {
    rates: ReturnType<typeof useCalculateRates>;
    calculateMaxAdd: (itemName: Items, target?: Items) => Decimal;
}

export const AppContext = createContext<ContextProps>({} as any);