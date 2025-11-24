const ProseMirrorStrategy = {
  async inject(editor, article) {
    console.log('[ProseMirror Strategy] Starting injection');
    console.log('[ProseMirror Strategy] Article has', article.content.length, 'blocks');
    
    try {
      const pmView = this.findProseMirrorView(editor);
      
      if (!pmView) {
        throw new Error('Could not access ProseMirror view - editor may be obfuscated');
      }
      
      console.log('[ProseMirror Strategy] Found ProseMirror view');
      console.log('[ProseMirror Strategy] Schema nodes:', Object.keys(pmView.state.schema.nodes));
      
      const nodes = await this.buildProseMirrorNodes(article, pmView.state.schema);
      console.log('[ProseMirror Strategy] Built', nodes.length, 'ProseMirror nodes');
      
      this.insertNodes(pmView, nodes);
      
      await RetryHandler.delay(500);
      
      const contentLength = (editor.innerHTML || editor.textContent || '').length;
      console.log('[ProseMirror Strategy] Final content length:', contentLength);
      
      if (contentLength < 100) {
        throw new Error('Content not inserted - editor is empty');
      }
      
      console.log('[ProseMirror Strategy] Success!');
      
      return {
        success: true,
        strategy: 'PROSEMIRROR',
        nodesInserted: nodes.length,
        contentLength: contentLength
      };
      
    } catch (error) {
      console.error('[ProseMirror Strategy] Failed:', error);
      throw error;
    }
  },
  
  findProseMirrorView(editor) {
    console.log('[ProseMirror Strategy] Searching for ProseMirror view...');
    
    for (const key in editor) {
      if (key.startsWith('__pm') || key.startsWith('pmView')) {
        console.log('[ProseMirror Strategy] Found view via key:', key);
        return editor[key];
      }
    }
    
    if (editor.__view) {
      console.log('[ProseMirror Strategy] Found view via __view');
      return editor.__view;
    }
    
    if (editor.pmViewDesc && editor.pmViewDesc.view) {
      console.log('[ProseMirror Strategy] Found view via pmViewDesc');
      return editor.pmViewDesc.view;
    }
    
    const pmProperties = ['pmView', 'view', 'editorView', '_view'];
    for (const prop of pmProperties) {
      if (editor[prop] && editor[prop].state && editor[prop].dispatch) {
        console.log('[ProseMirror Strategy] Found view via property:', prop);
        return editor[prop];
      }
    }
    
    if (window.ProseMirror && window.ProseMirror.view) {
      console.log('[ProseMirror Strategy] Found view via global ProseMirror');
      return window.ProseMirror.view;
    }
    
    console.log('[ProseMirror Strategy] Could not find ProseMirror view');
    console.log('[ProseMirror Strategy] Available keys:', Object.keys(editor).slice(0, 20));
    
    return null;
  },
  
  async buildProseMirrorNodes(article, schema) {
    const nodes = [];
    let imageCount = 0;
    
    for (const block of article.content) {
      try {
        let node = null;
        
        switch (block.type) {
          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
            if (schema.nodes.heading) {
              const level = parseInt(block.type.substring(1));
              node = schema.nodes.heading.create(
                { level: level },
                schema.text(block.content)
              );
            } else if (schema.nodes.paragraph) {
              node = schema.nodes.paragraph.create(
                null,
                schema.text(block.content)
              );
            }
            break;
            
          case 'p':
          case 'paragraph':
            if (schema.nodes.paragraph) {
              const lines = block.content.split('\n').map(line => line.trim()).filter(line => line);
              if (lines.length > 1) {
                for (const line of lines) {
                  const paragraphNode = schema.nodes.paragraph.create(
                    { class: 'article-editor-paragraph' },
                    schema.text(line)
                  );
                  nodes.push(paragraphNode);
                }
                continue;
              }
              node = schema.nodes.paragraph.create(
                { class: 'article-editor-paragraph' },
                schema.text(block.content)
              );
            }
            break;
            
          case 'image':
            imageCount++;
            if (imageCount === 1) {
              console.log('[ProseMirror Strategy] Skipping first image (thumbnail)');
              continue;
            }
            
            if (schema.nodes.image) {
              const imageSrc = block.src || block.dataURL;
              node = schema.nodes.image.create({
                src: imageSrc,
                alt: block.alt || '',
                class: 'article-editor-inline-image__image'
              });
            } else if (schema.nodes.figure) {
              const imageSrc = block.src || block.dataURL;
              node = schema.nodes.figure.create({
                src: imageSrc,
                alt: block.alt || ''
              });
            }
            break;
            
          case 'ul':
          case 'bullet_list':
            if (schema.nodes.bullet_list && schema.nodes.list_item) {
              const listItems = [];
              const breakoutParagraphs = [];

              block.items.forEach(item => {
                const parts = item.split('\n').map(p => p.trim()).filter(p => p);
                
                if (parts.length > 0) {
                  // First part stays in list
                  listItems.push(
                    schema.nodes.list_item.create(
                      null,
                      schema.nodes.paragraph.create(null, schema.text(parts[0]))
                    )
                  );
                  
                  // Subsequent parts break out into new paragraphs
                  for (let i = 1; i < parts.length; i++) {
                    breakoutParagraphs.push(
                      schema.nodes.paragraph.create(
                        { class: 'article-editor-paragraph' },
                        schema.text(parts[i])
                      )
                    );
                  }
                }
              });

              if (listItems.length > 0) {
                nodes.push(schema.nodes.bullet_list.create(null, listItems));
              }
              
              if (breakoutParagraphs.length > 0) {
                nodes.push(...breakoutParagraphs);
              }
              continue;
            }
            break;
            
          case 'ol':
          case 'ordered_list':
            if (schema.nodes.ordered_list && schema.nodes.list_item) {
              const listItems = [];
              const breakoutParagraphs = [];

              block.items.forEach(item => {
                const parts = item.split('\n').map(p => p.trim()).filter(p => p);
                
                if (parts.length > 0) {
                  listItems.push(
                    schema.nodes.list_item.create(
                      null,
                      schema.nodes.paragraph.create(null, schema.text(parts[0]))
                    )
                  );
                  
                  for (let i = 1; i < parts.length; i++) {
                    breakoutParagraphs.push(
                      schema.nodes.paragraph.create(
                        { class: 'article-editor-paragraph' },
                        schema.text(parts[i])
                      )
                    );
                  }
                }
              });

              if (listItems.length > 0) {
                nodes.push(schema.nodes.ordered_list.create(null, listItems));
              }
              
              if (breakoutParagraphs.length > 0) {
                nodes.push(...breakoutParagraphs);
              }
              continue;
            }
            break;
            
          case 'blockquote':
          case 'quote':
            if (schema.nodes.blockquote) {
              node = schema.nodes.blockquote.create(
                { class: 'article-editor-blockquote' },
                schema.text(block.content)
              );
            }
            break;
            
          case 'code':
          case 'code_block':
            if (schema.nodes.code_block) {
              node = schema.nodes.code_block.create(
                { class: 'article-editor-code-block' },
                schema.text(block.content)
              );
            } else if (schema.nodes.pre) {
              node = schema.nodes.pre.create(null, schema.text(block.content));
            }
            break;
        }
        
        if (node) {
          nodes.push(node);
        } else {
          console.warn('[ProseMirror Strategy] Could not create node for block type:', block.type);
        }
      } catch (error) {
        console.error('[ProseMirror Strategy] Error creating node for block:', block.type, error);
      }
    }
    
    try {
      if (schema.nodes.image) {
        const ctaImageURL = chrome.runtime.getURL('assets/ritz_cta.png');
        const ctaNode = schema.nodes.image.create({
          src: ctaImageURL,
          alt: 'AI Automation Audit Call-to-Action',
          class: 'article-editor-inline-image__image'
        });
        nodes.push(ctaNode);
      }
    } catch (error) {
      console.error('[ProseMirror Strategy] Error adding CTA image:', error);
    }
    
    return nodes;
  },
  
  insertNodes(pmView, nodes) {
    const { state, dispatch } = pmView;
    let tr = state.tr;
    
    console.log('[ProseMirror Strategy] Replacing document content with', nodes.length, 'nodes');
    console.log('[ProseMirror Strategy] Initial document size:', state.doc.content.size);
    
    try {
      tr = tr.delete(0, tr.doc.content.size);
      let currentPos = 0;
      
      for (let i = 0; i < nodes.length; i++) {
        try {
          tr = tr.insert(currentPos, nodes[i]);
          currentPos += nodes[i].nodeSize;
          console.log('[ProseMirror Strategy] Inserted node', i, 'size:', nodes[i].nodeSize);
        } catch (error) {
          console.error('[ProseMirror Strategy] Failed to insert node', i, error);
        }
      }
      
      dispatch(tr);
      console.log('[ProseMirror Strategy] Transaction dispatched');
      
    } catch (error) {
      console.error('[ProseMirror Strategy] Failed to dispatch transaction:', error);
      throw error;
    }
  }
};







