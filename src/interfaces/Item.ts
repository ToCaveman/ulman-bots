// masīvs ar vismaz vienu vērtību
interface ids extends Array<string> {
  0: string;
  [key: number]: string;
}

interface categories extends Array<number> {
  0: number;
  [key: number]: number;
}

interface Item {
  ids: ids; // mantu id ko izmanto komandās, piemēram /pirkt <id>
  nameNomVsk: string; // nominatīvs vienskaitlis
  nameNomDsk: string; // nominatīvs daudzskaitlis
  nameAkuVsk: string; // akuzatīvs vienskaitlis
  nameAkuDsk: string; // akuzatīvs daudzskaitlis
  categories: categories; // kategorijas - veikals, zivis utt
  value: number;
  removedOnUse?: boolean;
  use?: () => void;
}

export default Item;