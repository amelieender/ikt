import { Component, OnInit, Sanitizer } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BackendService, Post } from '../backend.service';

@Component({
  selector: 'app-read',
  templateUrl: './read.component.html',
  styleUrls: ['./read.component.css']
})
export class ReadComponent implements OnInit {

  allPosts!: Post[];

  constructor(private bs: BackendService,
              private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.bs.readAll()
    .then( posts => {
      this.allPosts = posts;
      console.log(posts);
    })
    .catch( err => {
      console.log(err);
    })
  }

  imgSrc(base64code: string): SafeResourceUrl {
    const src = 'data:image/png;base64,' + base64code;
    return this.sanitizer.bypassSecurityTrustResourceUrl(src);
  }
}
