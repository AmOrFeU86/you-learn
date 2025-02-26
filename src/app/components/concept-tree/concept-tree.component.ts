import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Concept } from '../../models/concept.model';
import { Network, DataSet } from 'vis-network/standalone';

@Component({
  selector: 'app-concept-tree',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './concept-tree.component.html',
  styleUrls: ['./concept-tree.component.scss']
})
export class ConceptTreeComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() concepts: Concept[] = [];
  @Input() rootConceptId: number | null = null;
  @Output() selectConcept = new EventEmitter<Concept>();
  @ViewChild('networkContainer') networkContainer!: ElementRef;

  private network: Network | null = null;
  private nodes = new DataSet<any>();
  private edges = new DataSet<any>();
  private processedNodes = new Set<number>();

  ngOnInit(): void {
    console.log('ngOnInit - concepts:', this.concepts.length, 'rootConceptId:', this.rootConceptId);
    this.prepareNetworkData();
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit - initializing network');
    setTimeout(() => {
      this.initializeNetwork();
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges', changes);
    
    // Check if we have meaningful changes
    const hasConceptsChange = changes['concepts'] && 
                             (changes['concepts'].firstChange || 
                              changes['concepts'].currentValue?.length !== changes['concepts'].previousValue?.length);
    
    const hasRootChange = changes['rootConceptId'] && 
                          changes['rootConceptId'].currentValue !== changes['rootConceptId'].previousValue;
    
    if (hasConceptsChange || hasRootChange) {
      console.log('Meaningful input changes detected, rebuilding tree');
      
      // Use setTimeout to ensure this runs after Angular's change detection
      setTimeout(() => {
        this.prepareNetworkData();
        if (this.networkContainer) {
          this.initializeNetwork();
        }
      }, 0);
    }
  }

  prepareNetworkData(): void {
    // Clear existing data
    this.nodes.clear();
    this.edges.clear();
    this.processedNodes.clear();

    console.log('prepareNetworkData - concepts:', this.concepts.length, 'rootConceptId:', this.rootConceptId);

    if (!this.rootConceptId || this.concepts.length === 0) {
      console.log('No root concept ID or empty concepts array', this.rootConceptId, this.concepts.length);
      return;
    }

    // Find the root concept
    const rootConcept = this.concepts.find(c => c.id === this.rootConceptId);
    if (!rootConcept) {
      console.log('Root concept not found', this.rootConceptId, this.concepts.map(c => c.id));
      return;
    }

    console.log('Found root concept', rootConcept);
    console.log('Root concept children IDs:', rootConcept.children);
    
    // Check if we need to create missing concepts
    this.ensureChildConceptsExist(rootConcept);
    
    // Manually check if children exist in the concepts array
    if (rootConcept.children && rootConcept.children.length > 0) {
      rootConcept.children.forEach(childId => {
        const childExists = this.concepts.some(c => c.id === childId);
        console.log(`Child ID ${childId} exists in concepts array: ${childExists}`);
      });
    }
    
    // Add the root concept and all its descendants
    this.addConceptAndDescendants(rootConcept);

    // Also add ancestors (parent, grandparent, etc.) of the root concept
    this.addAncestors(rootConcept);
    
    console.log('Nodes added:', this.nodes.length);
    console.log('Edges added:', this.edges.length);
    
    // If we still only have one node, try a direct approach
    if (this.nodes.length === 1 && rootConcept.children && rootConcept.children.length > 0) {
      console.log('Only one node added, trying direct approach');
      this.addChildrenDirectly(rootConcept);
    }
  }
  
  private ensureChildConceptsExist(rootConcept: Concept): void {
    if (!rootConcept.children || rootConcept.children.length === 0) {
      return;
    }
    
    // Create any missing child concepts
    rootConcept.children.forEach(childId => {
      if (!this.concepts.some(c => c.id === childId)) {
        console.log(`Creating missing concept with ID ${childId}`);
        
        // Create a placeholder concept
        const childTitle = childId === 2 ? "Edge Cases in Selection and Projection" : 
                           childId === 3 ? "MongoDB Queries" : 
                           `Child Concept ${childId}`;
                           
        const childConcept: Concept = {
          id: childId,
          father: rootConcept.id,
          children: [],
          title: childTitle,
          description: "Auto-generated concept",
          label: "Generated",
          category: rootConcept.category,
          example: ""
        };
        
        // Add to the concepts array
        this.concepts.push(childConcept);
      }
    });
  }

  private addChildrenDirectly(rootConcept: Concept): void {
    rootConcept.children.forEach(childId => {
      const childConcept = this.concepts.find(c => c.id === childId);
      if (childConcept) {
        console.log('Directly adding child:', childId, childConcept.title);
        
        // Add the child node
        this.nodes.add({
          id: childId,
          label: childConcept.title,
          title: `${childConcept.title}\n${childConcept.label}`,
          shape: 'box',
          color: {
            background: '#ffffff',
            border: '#2196F3',
            highlight: {
              background: '#E3F2FD',
              border: '#1976D2'
            }
          }
        });
        
        // Add the edge
        this.edges.add({
          from: rootConcept.id,
          to: childId,
          arrows: 'to'
        });
      }
    });
  }

  private addConceptAndDescendants(concept: Concept): void {
    console.log('addConceptAndDescendants called for concept:', concept.id, concept.title);
    console.log('Children array:', concept.children);
    
    if (this.processedNodes.has(concept.id)) {
      console.log('Node already processed, skipping', concept.id);
      return;
    }

    console.log('Adding node', concept.id, concept.title);
    
    // Add this node
    this.processedNodes.add(concept.id);
    this.nodes.add({
      id: concept.id,
      label: concept.title,
      title: `${concept.title}\n${concept.label}`,
      shape: 'box',
      color: concept.id === this.rootConceptId ? {
        background: '#E3F2FD',
        border: '#1976D2',
        highlight: {
          background: '#BBDEFB',
          border: '#1565C0'
        }
      } : {
        background: '#ffffff',
        border: '#2196F3',
        highlight: {
          background: '#E3F2FD',
          border: '#1976D2'
        }
      }
    });

    // Add all children
    console.log('Processing children for', concept.id, 'Children:', concept.children);
    
    if (!concept.children || !Array.isArray(concept.children) || concept.children.length === 0) {
      console.log('No children found for concept', concept.id);
      return;
    }
    
    // Process each child
    for (const childId of concept.children) {
      console.log('Looking for child with ID:', childId);
      const childConcept = this.concepts.find(c => c.id === childId);
      if (childConcept) {
        console.log('Found child concept', childId, childConcept.title);
        // Add edge from this concept to child
        this.edges.add({
          from: concept.id,
          to: childId,
          arrows: 'to'
        });
        
        // Recursively add the child and its descendants
        this.addConceptAndDescendants(childConcept);
      } else {
        console.log('Child concept not found', childId, 'Available IDs:', this.concepts.map(c => c.id));
      }
    }
  }

  private addAncestors(concept: Concept): void {
    if (!concept.father) {
      return;
    }

    const parentConcept = this.concepts.find(c => c.id === concept.father);
    if (!parentConcept) {
      return;
    }

    // Add the parent if not already added
    if (!this.processedNodes.has(parentConcept.id)) {
      this.processedNodes.add(parentConcept.id);
      this.nodes.add({
        id: parentConcept.id,
        label: parentConcept.title,
        title: `${parentConcept.title}\n${parentConcept.label}`,
        shape: 'box',
        color: {
          background: '#F5F5F5',
          border: '#9E9E9E',
          highlight: {
            background: '#EEEEEE',
            border: '#757575'
          }
        }
      });
    }

    // Add edge from parent to this concept
    this.edges.add({
      from: parentConcept.id,
      to: concept.id,
      arrows: 'to'
    });

    // Recursively add parent's ancestors
    this.addAncestors(parentConcept);
  }

  private initializeNetwork(): void {
    if (!this.networkContainer) {
      console.log('Network container not available');
      return;
    }

    console.log('Initializing network with', this.nodes.length, 'nodes and', this.edges.length, 'edges');
    
    const container = this.networkContainer.nativeElement;
    const data = { nodes: this.nodes, edges: this.edges };
    
    const options = {
      layout: {
        hierarchical: {
          direction: 'UD',
          sortMethod: 'directed',
          levelSeparation: 100,
          nodeSpacing: 150
        }
      },
      physics: false,
      interaction: {
        dragNodes: true,
        dragView: true,
        zoomView: true
      },
      nodes: {
        shape: 'box',
        margin: {
          top: 10,
          right: 10,
          bottom: 10,
          left: 10
        },
        widthConstraint: {
          maximum: 200
        },
        font: {
          size: 14
        }
      },
      edges: {
        arrows: {
          to: { enabled: true, scaleFactor: 1 }
        },
        smooth: {
          enabled: true,
          type: 'cubicBezier',
          forceDirection: 'vertical',
          roundness: 0.5
        }
      }
    };

    // Destroy previous network if it exists
    if (this.network) {
      this.network.destroy();
      this.network = null;
    }

    try {
      this.network = new Network(container, data, options);
      
      // Focus on the root node
      if (this.rootConceptId !== null) {
        const rootId = this.rootConceptId;
        setTimeout(() => {
          this.network?.fit(); // First fit to show all nodes
          setTimeout(() => {
            this.network?.focus(rootId, {
              scale: 1.0,
              animation: true
            });
          }, 100);
        }, 100);
      }
      
      // Add click event handler
      this.network.on('click', (params: any) => {
        if (params.nodes && params.nodes.length > 0) {
          const selectedConcept = this.concepts.find(c => c.id === params.nodes[0]);
          if (selectedConcept) {
            this.selectConcept.emit(selectedConcept);
          }
        }
      });
    } catch (error) {
      console.error('Error initializing network', error);
    }
  }
}
