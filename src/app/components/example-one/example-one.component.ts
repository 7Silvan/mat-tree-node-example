import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Injectable, AfterViewChecked, ViewChildren, ElementRef, Renderer2 } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener, MatTreeNode } from '@angular/material/tree';
import { BehaviorSubject, Observable, of as observableOf } from 'rxjs';

export class FileNode {
  children: FileNode[];
  filename: string;
  type: any;
}

export class FileFlatNode {
  filename: string;
  type: any;
  level: number;
  expandable: boolean;
}

const TREE_DATA = `
  {
    "Documents": {
      "angular": {
        "src": {
          "core": "ts",
          "compiler": "ts"
        }
      },
      "material2": {
        "src": {
          "button": "ts",
          "checkbox": "ts",
          "input": "ts"
        }
      }
    },
    "Downloads": {
        "Tutorial": "html",
        "November": "pdf",
        "October": "pdf"
    },
    "Pictures": {
        "Sun": "png",
        "Woods": "jpg",
        "Photo Booth Library": {
          "Contents": "dir",
          "Pictures": "dir"
        }
    },
    "Applications": {
        "Chrome": "app",
        "Calendar": "app",
        "Webstorm": "app"
    }
}`;

@Injectable()
export class FileDatabase {
  dataChange: BehaviorSubject<FileNode[]> = new BehaviorSubject<FileNode[]>([]);

  get data(): FileNode[] { return this.dataChange.value; }

  constructor() {
    this.initialize();
  }

  initialize() {
    // Parse the string to json object.
    const dataObject = JSON.parse(TREE_DATA);

    // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
    //     file node as children.
    const data = this.buildFileTree(dataObject, 0);

    // Notify the change.
    this.dataChange.next(data);
  }

  buildFileTree(value: any, level: number): FileNode[] {
    let data: any[] = [];
    for (let k in value) {
      let v = value[k];
      let node = new FileNode();
      node.filename = `${k}`;
      if (v === null || v === undefined) {
        // no action
      } else if (typeof v === 'object') {
        node.children = this.buildFileTree(v, level + 1);
      } else {
        node.type = v;
      }
      data.push(node);
    }
    return data;
  }
}

@Component({
  selector: 'app-example-one',
  templateUrl: 'example-one.component.html',
  styleUrls: ['example-one.component.css'],
  providers: [FileDatabase]
})
export class ExampleOneComponent implements AfterViewChecked {
  treeControl: FlatTreeControl<FileFlatNode>;

  treeFlattener: MatTreeFlattener<FileNode, FileFlatNode>;

  dataSource: MatTreeFlatDataSource<FileNode, FileFlatNode>;

  constructor(database: FileDatabase, private renderer: Renderer2) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this._getLevel,
      this._isExpandable, this._getChildren);
    this.treeControl = new FlatTreeControl<FileFlatNode>(this._getLevel, this._isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    database.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });
  }

  transformer = (node: FileNode, level: number) => {
    let flatNode = new FileFlatNode();
    flatNode.filename = node.filename;
    flatNode.type = node.type;
    flatNode.level = level;
    flatNode.expandable = !!node.children;
    return flatNode;
  }

  private _getLevel = (node: FileFlatNode) => { return node.level; };

  private _isExpandable = (node: FileFlatNode) => { return node.expandable; };

  private _getChildren = (node: FileNode): Observable<FileNode[]> => {
    return observableOf(node.children);
  }

  hasChild = (_: number, _nodeData: FileFlatNode) => { return _nodeData.expandable; };
  
  @ViewChildren(MatTreeNode, { read: ElementRef }) treeNodes: ElementRef[];
  
  hasListener: any[] = [];
  oldHighlight: ElementRef;
  
  updateHighlight = (newHighlight: ElementRef) => {
    this.oldHighlight && this.renderer.removeClass(this.oldHighlight.nativeElement, 'background-highlight');
        
    this.renderer.addClass(newHighlight.nativeElement, 'background-highlight');
    this.oldHighlight = newHighlight;
  }
  
  ngAfterViewChecked() {
    this.treeNodes.forEach((reference) => {
      if (!this.hasListener.includes(reference.nativeElement)) {
        console.log('* tick');
        
        this.renderer.listen(reference.nativeElement, 'click', () => {
          this.updateHighlight(reference);
        });
        this.renderer.listen(reference.nativeElement.children.item(0), 'click', () => {
          this.updateHighlight(reference);
        });
        
        this.hasListener = this.hasListener.concat([ reference.nativeElement ]);
      }
    });
    
    this.hasListener = this.hasListener.filter((element) => document.contains(element));
    console.log('*', this.hasListener.length);
  }
}
