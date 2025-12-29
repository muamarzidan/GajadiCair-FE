export interface IFaceBox {
  x: number;
  y: number;
  w: number;
  h: number;
};
export interface ICheckFaceResponse {
  has_face: boolean;
  count: number;
  boxes: IFaceBox[];
};
export interface ICheckFaceRequest {
  image: File;
};

export interface GestureListResponse {
  allowed_gestures: string[];
  total: number;
}

export type HandType = 'Left' | 'Right';

export interface GestureSelection {
  gesture: string;
  hand: HandType;
}
