import { useDispatch, useSelector } from "react-redux";

// İleride tip eklemeye gerek kalmadan tek noktadan kullanmak için
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
