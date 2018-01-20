import { Component, OnInit } from '@angular/core';
import {Image} from "../../image.model";
import {VisualizeService} from "../../visualize.service";

@Component({
  selector: 'app-input-image',
  templateUrl: './input-image.component.html',
  styleUrls: ['./input-image.component.css'],
})
export class InputImageComponent implements OnInit {
  image: Image;
  constructor(private visualizeService: VisualizeService) { }

  ngOnInit() {
    this.image = this.visualizeService.image1;
  }

}
