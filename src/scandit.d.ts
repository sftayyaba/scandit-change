type Barcode = {
    data: string,
    symbology: string,
  }
  
  type ScanSession = {
    pauseScanning(),
    stopScanning(),
    rejectCode(Barcode),
    newlyRecognizedCodes: Barcode[],
    newlyLocalizedCodes: Barcode[],
    allRecognizedCodes: Barcode[],
  }
  
  interface ScannerDelegate {
    didScan(session: ScanSession)
  }
  
  type BarcodePicker = any;
  type ScanSettings = any;
  type UiSettings = {
    viewfinder: {
      style: number, // enum
      portrait: {
        width: number,
        height: number,
      },
      landscape: {
        width: number,
        height: number,
      },
    },
    searchBar: boolean,
    feedback: {
      beep: boolean,
      vibrate: boolean,
    },
    torch: {
      enabled: boolean,
      offset: {
        left: number,
        top: number,
      }
    },
    cameraSwitch: {
      visibility: number, // enum
      offset: {
        right: number,
        top: number,
      },
    },
  };
  
  type Constraint = number | string;
  
  type Constraints = {
    topMargin?: Constraint,
    rightMargin?: Constraint,
    bottomMargin?: Constraint,
    leftMargin?: Constraint,
    width?: Constraint,
    height?: Constraint,
  }
  
  type Margin = number;
  
  type Margins = {
    top: Margin,
    right: Margin,
    bottom: Margin,
    left: Margin,
  }
  
//   declare let Scandit;
  