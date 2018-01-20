import {Injectable, OnInit} from '@angular/core';
import { Image } from "./image.model";

@Injectable()
export class VisualizeService implements OnInit {
  image1: Image;
  image2: Image;

  constructor() {
    // default values
    this.image1 = new Image('img1', "http://localhost:5000/static/mockup_files/img2.jpg");
    this.image2 = new Image('img2', 'http://localhost:5000/static/mockup_files/img2.jpg');
  }

  ngOnInit() {
  }

}
