import { atom, selector, DefaultValue, useRecoilValue, useResetRecoilState, useSetRecoilState, useRecoilState } from 'recoil';
import { isEqual, debounce } from 'lodash';
import { v4 } from 'uuid';
import { createContext, useContext, useMemo, useCallback, useEffect } from 'react';
import Ut, { SWRConfig } from 'swr';
import Gt from 'socket.io-client';
export { Socket } from 'socket.io-client';
import { toast } from 'sonner';

var ze=o=>{let e={},t=new Date;return t.setHours(0,0,0,0),[...o].sort((s,n)=>new Date(n.createdAt).getTime()-new Date(s.createdAt).getTime()).forEach(s=>{let n=new Date(s.createdAt);n.setHours(0,0,0,0);let r=Math.floor((t.getTime()-n.getTime())/864e5),a;r===0?a="Today":r===1?a="Yesterday":r<=7?a="Previous 7 days":r<=30?a="Previous 30 days":a=n.toLocaleString("default",{month:"long",year:"numeric"}),e[a]??(e[a]=[]),e[a].push(s);}),e};var He=[4186.01,4434.92,4698.63,4978.03,5274.04,5587.65,5919.91,6271.93,6644.88,7040,7458.62,7902.13],Ct=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],M=[],ue=[];for(let o=1;o<=8;o++)for(let e=0;e<He.length;e++){let t=He[e];M.push(t/Math.pow(2,8-o)),ue.push(Ct[e]+o);}var le=[32,2e3],Me=M.filter((o,e)=>M[e]>le[0]&&M[e]<le[1]),We=ue.filter((o,e)=>M[e]>le[0]&&M[e]<le[1]);var U=class o{static getFrequencies(e,t,s,n="frequency",r=-100,a=-30){s||(s=new Float32Array(e.frequencyBinCount),e.getFloatFrequencyData(s));let i=t/2,f=1/s.length*i,m,u,d;if(n==="music"||n==="voice"){let S=n==="voice"?Me:M,k=Array(S.length).fill(r);for(let F=0;F<s.length;F++){let q=F*f,V=s[F];for(let x=S.length-1;x>=0;x--)if(q>S[x]){k[x]=Math.max(k[x],V);break}}m=k,u=n==="voice"?Me:M,d=n==="voice"?We:ue;}else m=Array.from(s),u=m.map((S,k)=>f*k),d=u.map(S=>`${S.toFixed(2)} Hz`);let g=m.map(S=>Math.max(0,Math.min((S-r)/(a-r),1)));return {values:new Float32Array(g),frequencies:u,labels:d}}constructor(e,t=null){if(this.fftResults=[],t){let{length:s,sampleRate:n}=t,r=new OfflineAudioContext({length:s,sampleRate:n}),a=r.createBufferSource();a.buffer=t;let i=r.createAnalyser();i.fftSize=8192,i.smoothingTimeConstant=.1,a.connect(i);let f=1/60,m=s/n,u=d=>{let g=f*d;g<m&&r.suspend(g).then(()=>{let y=new Float32Array(i.frequencyBinCount);i.getFloatFrequencyData(y),this.fftResults.push(y),u(d+1);}),d===1?r.startRendering():r.resume();};a.start(0),u(1),this.audio=e,this.context=r,this.analyser=i,this.sampleRate=n,this.audioBuffer=t;}else {let s=new AudioContext,n=s.createMediaElementSource(e),r=s.createAnalyser();r.fftSize=8192,r.smoothingTimeConstant=.1,n.connect(r),r.connect(s.destination),this.audio=e,this.context=s,this.analyser=r,this.sampleRate=this.context.sampleRate,this.audioBuffer=null;}}getFrequencies(e="frequency",t=-100,s=-30){let n=null;if(this.audioBuffer&&this.fftResults.length){let r=this.audio.currentTime/this.audio.duration,a=Math.min(r*this.fftResults.length|0,this.fftResults.length-1);n=this.fftResults[a];}return o.getFrequencies(this.analyser,this.sampleRate,n,e,t,s)}async resumeIfSuspended(){return this.context.state==="suspended"&&await this.context.resume(),!0}};globalThis.AudioAnalysis=U;var T=class{static floatTo16BitPCM(e){let t=new ArrayBuffer(e.length*2),s=new DataView(t),n=0;for(let r=0;r<e.length;r++,n+=2){let a=Math.max(-1,Math.min(1,e[r]));s.setInt16(n,a<0?a*32768:a*32767,!0);}return t}static mergeBuffers(e,t){let s=new Uint8Array(e.byteLength+t.byteLength);return s.set(new Uint8Array(e),0),s.set(new Uint8Array(t),e.byteLength),s.buffer}_packData(e,t){return [new Uint8Array([t,t>>8]),new Uint8Array([t,t>>8,t>>16,t>>24])][e]}pack(e,t){if(t?.bitsPerSample)if(t?.channels){if(!t?.data)throw new Error('Missing "data"')}else throw new Error('Missing "channels"');else throw new Error('Missing "bitsPerSample"');let{bitsPerSample:s,channels:n,data:r}=t,a=["RIFF",this._packData(1,4+(8+24)+(8+8)),"WAVE","fmt ",this._packData(1,16),this._packData(0,1),this._packData(0,n.length),this._packData(1,e),this._packData(1,e*n.length*s/8),this._packData(0,n.length*s/8),this._packData(0,s),"data",this._packData(1,n[0].length*n.length*s/8),r],i=new Blob(a,{type:"audio/mpeg"}),f=URL.createObjectURL(i);return {blob:i,url:f,channelCount:n.length,sampleRate:e,duration:r.byteLength/(n.length*e*2)}}};globalThis.WavPacker=T;var bt=`
class AudioProcessor extends AudioWorkletProcessor {

  constructor() {
    super();
    this.port.onmessage = this.receive.bind(this);
    this.initialize();
  }

  initialize() {
    this.foundAudio = false;
    this.recording = false;
    this.chunks = [];
  }

  /**
   * Concatenates sampled chunks into channels
   * Format is chunk[Left[], Right[]]
   */
  readChannelData(chunks, channel = -1, maxChannels = 9) {
    let channelLimit;
    if (channel !== -1) {
      if (chunks[0] && chunks[0].length - 1 < channel) {
        throw new Error(
          \`Channel \${channel} out of range: max \${chunks[0].length}\`
        );
      }
      channelLimit = channel + 1;
    } else {
      channel = 0;
      channelLimit = Math.min(chunks[0] ? chunks[0].length : 1, maxChannels);
    }
    const channels = [];
    for (let n = channel; n < channelLimit; n++) {
      const length = chunks.reduce((sum, chunk) => {
        return sum + chunk[n].length;
      }, 0);
      const buffers = chunks.map((chunk) => chunk[n]);
      const result = new Float32Array(length);
      let offset = 0;
      for (let i = 0; i < buffers.length; i++) {
        result.set(buffers[i], offset);
        offset += buffers[i].length;
      }
      channels[n] = result;
    }
    return channels;
  }

  /**
   * Combines parallel audio data into correct format,
   * channels[Left[], Right[]] to float32Array[LRLRLRLR...]
   */
  formatAudioData(channels) {
    if (channels.length === 1) {
      // Simple case is only one channel
      const float32Array = channels[0].slice();
      const meanValues = channels[0].slice();
      return { float32Array, meanValues };
    } else {
      const float32Array = new Float32Array(
        channels[0].length * channels.length
      );
      const meanValues = new Float32Array(channels[0].length);
      for (let i = 0; i < channels[0].length; i++) {
        const offset = i * channels.length;
        let meanValue = 0;
        for (let n = 0; n < channels.length; n++) {
          float32Array[offset + n] = channels[n][i];
          meanValue += channels[n][i];
        }
        meanValues[i] = meanValue / channels.length;
      }
      return { float32Array, meanValues };
    }
  }

  /**
   * Converts 32-bit float data to 16-bit integers
   */
  floatTo16BitPCM(float32Array) {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buffer;
  }

  /**
   * Retrieves the most recent amplitude values from the audio stream
   * @param {number} channel
   */
  getValues(channel = -1) {
    const channels = this.readChannelData(this.chunks, channel);
    const { meanValues } = this.formatAudioData(channels);
    return { meanValues, channels };
  }

  /**
   * Exports chunks as an audio/wav file
   */
  export() {
    const channels = this.readChannelData(this.chunks);
    const { float32Array, meanValues } = this.formatAudioData(channels);
    const audioData = this.floatTo16BitPCM(float32Array);
    return {
      meanValues: meanValues,
      audio: {
        bitsPerSample: 16,
        channels: channels,
        data: audioData,
      },
    };
  }

  receive(e) {
    const { event, id } = e.data;
    let receiptData = {};
    switch (event) {
      case 'start':
        this.recording = true;
        break;
      case 'stop':
        this.recording = false;
        break;
      case 'clear':
        this.initialize();
        break;
      case 'export':
        receiptData = this.export();
        break;
      case 'read':
        receiptData = this.getValues();
        break;
      default:
        break;
    }
    // Always send back receipt
    this.port.postMessage({ event: 'receipt', id, data: receiptData });
  }

  sendChunk(chunk) {
    const channels = this.readChannelData([chunk]);
    const { float32Array, meanValues } = this.formatAudioData(channels);
    const rawAudioData = this.floatTo16BitPCM(float32Array);
    const monoAudioData = this.floatTo16BitPCM(meanValues);
    this.port.postMessage({
      event: 'chunk',
      data: {
        mono: monoAudioData,
        raw: rawAudioData,
      },
    });
  }

  process(inputList, outputList, parameters) {
    // Copy input to output (e.g. speakers)
    // Note that this creates choppy sounds with Mac products
    const sourceLimit = Math.min(inputList.length, outputList.length);
    for (let inputNum = 0; inputNum < sourceLimit; inputNum++) {
      const input = inputList[inputNum];
      const output = outputList[inputNum];
      const channelCount = Math.min(input.length, output.length);
      for (let channelNum = 0; channelNum < channelCount; channelNum++) {
        input[channelNum].forEach((sample, i) => {
          output[channelNum][i] = sample;
        });
      }
    }
    const inputs = inputList[0];
    // There's latency at the beginning of a stream before recording starts
    // Make sure we actually receive audio data before we start storing chunks
    let sliceIndex = 0;
    if (!this.foundAudio) {
      for (const channel of inputs) {
        sliceIndex = 0; // reset for each channel
        if (this.foundAudio) {
          break;
        }
        if (channel) {
          for (const value of channel) {
            if (value !== 0) {
              // find only one non-zero entry in any channel
              this.foundAudio = true;
              break;
            } else {
              sliceIndex++;
            }
          }
        }
      }
    }
    if (inputs && inputs[0] && this.foundAudio && this.recording) {
      // We need to copy the TypedArray, because the \`process\`
      // internals will reuse the same buffer to hold each input
      const chunk = inputs.map((input) => input.slice(sliceIndex));
      this.chunks.push(chunk);
      this.sendChunk(chunk);
    }
    return true;
  }
}

registerProcessor('audio_processor', AudioProcessor);
`,xt=new Blob([bt],{type:"application/javascript"}),vt=URL.createObjectURL(xt),Ke=vt;var z=class{constructor({sampleRate:e=24e3,outputToSpeakers:t=!1,debug:s=!1}={}){this.scriptSrc=Ke,this.sampleRate=e,this.outputToSpeakers=t,this.debug=!!s,this._deviceChangeCallback=null,this._devices=[],this.stream=null,this.processor=null,this.source=null,this.node=null,this.recording=!1,this._lastEventId=0,this.eventReceipts={},this.eventTimeout=5e3,this._chunkProcessor=()=>{},this._chunkProcessorSize=void 0,this._chunkProcessorBuffer={raw:new ArrayBuffer(0),mono:new ArrayBuffer(0)};}static async decode(e,t=24e3,s=-1){let n=new AudioContext({sampleRate:t}),r,a;if(e instanceof Blob){if(s!==-1)throw new Error('Can not specify "fromSampleRate" when reading from Blob');a=e,r=await a.arrayBuffer();}else if(e instanceof ArrayBuffer){if(s!==-1)throw new Error('Can not specify "fromSampleRate" when reading from ArrayBuffer');r=e,a=new Blob([r],{type:"audio/wav"});}else {let u,d;if(e instanceof Int16Array){d=e,u=new Float32Array(e.length);for(let k=0;k<e.length;k++)u[k]=e[k]/32768;}else if(e instanceof Float32Array)u=e;else if(e instanceof Array)u=new Float32Array(e);else throw new Error('"audioData" must be one of: Blob, Float32Arrray, Int16Array, ArrayBuffer, Array<number>');if(s===-1)throw new Error('Must specify "fromSampleRate" when reading from Float32Array, In16Array or Array');if(s<3e3)throw new Error('Minimum "fromSampleRate" is 3000 (3kHz)');d||(d=T.floatTo16BitPCM(u));let g={bitsPerSample:16,channels:[u],data:d};a=new T().pack(s,g).blob,r=await a.arrayBuffer();}let i=await n.decodeAudioData(r),f=i.getChannelData(0),m=URL.createObjectURL(a);return {blob:a,url:m,values:f,audioBuffer:i}}log(){return this.debug&&this.log(...arguments),!0}getSampleRate(){return this.sampleRate}getStatus(){return this.processor?this.recording?"recording":"paused":"ended"}async _event(e,t={},s=null){if(s=s||this.processor,!s)throw new Error("Can not send events without recording first");let n={event:e,id:this._lastEventId++,data:t};s.port.postMessage(n);let r=new Date().valueOf();for(;!this.eventReceipts[n.id];){if(new Date().valueOf()-r>this.eventTimeout)throw new Error(`Timeout waiting for "${e}" event`);await new Promise(i=>setTimeout(()=>i(!0),1));}let a=this.eventReceipts[n.id];return delete this.eventReceipts[n.id],a}listenForDeviceChange(e){if(e===null&&this._deviceChangeCallback)navigator.mediaDevices.removeEventListener("devicechange",this._deviceChangeCallback),this._deviceChangeCallback=null;else if(e!==null){let t=0,s=[],n=a=>a.map(i=>i.deviceId).sort().join(","),r=async()=>{let a=++t,i=await this.listDevices();a===t&&n(s)!==n(i)&&(s=i,e(i.slice()));};navigator.mediaDevices.addEventListener("devicechange",r),r(),this._deviceChangeCallback=r;}return !0}async requestPermission(){let e=await navigator.permissions.query({name:"microphone"});if(e.state==="denied")window.alert("You must grant microphone access to use this feature.");else if(e.state==="prompt")try{(await navigator.mediaDevices.getUserMedia({audio:!0})).getTracks().forEach(n=>n.stop());}catch{window.alert("You must grant microphone access to use this feature.");}return !0}async listDevices(){if(!navigator.mediaDevices||!("enumerateDevices"in navigator.mediaDevices))throw new Error("Could not request user devices");await this.requestPermission();let t=(await navigator.mediaDevices.enumerateDevices()).filter(r=>r.kind==="audioinput"),s=t.findIndex(r=>r.deviceId==="default"),n=[];if(s!==-1){let r=t.splice(s,1)[0],a=t.findIndex(i=>i.groupId===r.groupId);a!==-1&&(r=t.splice(a,1)[0]),r.default=!0,n.push(r);}return n.concat(t)}async begin(e){if(this.processor)throw new Error("Already connected: please call .end() to start a new session");if(!navigator.mediaDevices||!("getUserMedia"in navigator.mediaDevices))throw new Error("Could not request user media");try{let i={audio:!0};e&&(i.audio={deviceId:{exact:e}}),this.stream=await navigator.mediaDevices.getUserMedia(i);}catch{throw new Error("Could not start media stream")}let t=new AudioContext({sampleRate:this.sampleRate}),s=t.createMediaStreamSource(this.stream);try{await t.audioWorklet.addModule(this.scriptSrc);}catch(i){throw console.error(i),new Error(`Could not add audioWorklet module: ${this.scriptSrc}`)}let n=new AudioWorkletNode(t,"audio_processor");n.port.onmessage=i=>{let{event:f,id:m,data:u}=i.data;if(f==="receipt")this.eventReceipts[m]=u;else if(f==="chunk")if(this._chunkProcessorSize){let d=this._chunkProcessorBuffer;this._chunkProcessorBuffer={raw:T.mergeBuffers(d.raw,u.raw),mono:T.mergeBuffers(d.mono,u.mono)},this._chunkProcessorBuffer.mono.byteLength>=this._chunkProcessorSize&&(this._chunkProcessor(this._chunkProcessorBuffer),this._chunkProcessorBuffer={raw:new ArrayBuffer(0),mono:new ArrayBuffer(0)});}else this._chunkProcessor(u);};let r=s.connect(n),a=t.createAnalyser();return a.fftSize=8192,a.smoothingTimeConstant=.1,r.connect(a),this.outputToSpeakers&&(console.warn(`Warning: Output to speakers may affect sound quality,
especially due to system audio feedback preventative measures.
use only for debugging`),a.connect(t.destination)),this.source=s,this.node=r,this.analyser=a,this.processor=n,!0}getFrequencies(e="frequency",t=-100,s=-30){if(!this.processor)throw new Error("Session ended: please call .begin() first");return U.getFrequencies(this.analyser,this.sampleRate,null,e,t,s)}async pause(){if(this.processor){if(!this.recording)throw new Error("Already paused: please call .record() first")}else throw new Error("Session ended: please call .begin() first");return this._chunkProcessorBuffer.raw.byteLength&&this._chunkProcessor(this._chunkProcessorBuffer),this.log("Pausing ..."),await this._event("stop"),this.recording=!1,!0}async record(e=()=>{},t=8192){if(this.processor){if(this.recording)throw new Error("Already recording: please call .pause() first");if(typeof e!="function")throw new Error("chunkProcessor must be a function")}else throw new Error("Session ended: please call .begin() first");return this._chunkProcessor=e,this._chunkProcessorSize=t,this._chunkProcessorBuffer={raw:new ArrayBuffer(0),mono:new ArrayBuffer(0)},this.log("Recording ..."),await this._event("start"),this.recording=!0,!0}async clear(){if(!this.processor)throw new Error("Session ended: please call .begin() first");return await this._event("clear"),!0}async read(){if(!this.processor)throw new Error("Session ended: please call .begin() first");return this.log("Reading ..."),await this._event("read")}async save(e=!1){if(!this.processor)throw new Error("Session ended: please call .begin() first");if(!e&&this.recording)throw new Error("Currently recording: please call .pause() first, or call .save(true) to force");this.log("Exporting ...");let t=await this._event("export");return new T().pack(this.sampleRate,t.audio)}async end(){if(!this.processor)throw new Error("Session ended: please call .begin() first");let e=this.processor;this.log("Stopping ..."),await this._event("stop"),this.recording=!1,this.stream.getTracks().forEach(a=>a.stop()),this.log("Exporting ...");let s=await this._event("export",{},e);return this.processor.disconnect(),this.source.disconnect(),this.node.disconnect(),this.analyser.disconnect(),this.stream=null,this.processor=null,this.source=null,this.node=null,new T().pack(this.sampleRate,s.audio)}async quit(){return this.listenForDeviceChange(null),this.processor&&await this.end(),!0}};globalThis.WavRecorder=z;var Tt=`
class StreamProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.hasStarted = false;
    this.hasInterrupted = false;
    this.outputBuffers = [];
    this.bufferLength = 128;
    this.write = { buffer: new Float32Array(this.bufferLength), trackId: null };
    this.writeOffset = 0;
    this.trackSampleOffsets = {};
    this.port.onmessage = (event) => {
      if (event.data) {
        const payload = event.data;
        if (payload.event === 'write') {
          const int16Array = payload.buffer;
          const float32Array = new Float32Array(int16Array.length);
          for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 0x8000; // Convert Int16 to Float32
          }
          this.writeData(float32Array, payload.trackId);
        } else if (
          payload.event === 'offset' ||
          payload.event === 'interrupt'
        ) {
          const requestId = payload.requestId;
          const trackId = this.write.trackId;
          const offset = this.trackSampleOffsets[trackId] || 0;
          this.port.postMessage({
            event: 'offset',
            requestId,
            trackId,
            offset,
          });
          if (payload.event === 'interrupt') {
            this.hasInterrupted = true;
          }
        } else {
          throw new Error(\`Unhandled event "\${payload.event}"\`);
        }
      }
    };
  }

  writeData(float32Array, trackId = null) {
    let { buffer } = this.write;
    let offset = this.writeOffset;
    for (let i = 0; i < float32Array.length; i++) {
      buffer[offset++] = float32Array[i];
      if (offset >= buffer.length) {
        this.outputBuffers.push(this.write);
        this.write = { buffer: new Float32Array(this.bufferLength), trackId };
        buffer = this.write.buffer;
        offset = 0;
      }
    }
    this.writeOffset = offset;
    return true;
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const outputChannelData = output[0];
    const outputBuffers = this.outputBuffers;
    if (this.hasInterrupted) {
      this.port.postMessage({ event: 'stop' });
      return false;
    } else if (outputBuffers.length) {
      this.hasStarted = true;
      const { buffer, trackId } = outputBuffers.shift();
      for (let i = 0; i < outputChannelData.length; i++) {
        outputChannelData[i] = buffer[i] || 0;
      }
      if (trackId) {
        this.trackSampleOffsets[trackId] =
          this.trackSampleOffsets[trackId] || 0;
        this.trackSampleOffsets[trackId] += buffer.length;
      }
      return true;
    } else if (this.hasStarted) {
      this.port.postMessage({ event: 'stop' });
      return false;
    } else {
      return true;
    }
  }
}

registerProcessor('stream_processor', StreamProcessor);
`,Pt=new Blob([Tt],{type:"application/javascript"}),_t=URL.createObjectURL(Pt),Ge=_t;var H=class{constructor({sampleRate:e=24e3,onStop:t}={}){this.scriptSrc=Ge,this.onStop=t,this.sampleRate=e,this.context=null,this.stream=null,this.analyser=null,this.trackSampleOffsets={},this.interruptedTrackIds={};}async connect(){this.context=new AudioContext({sampleRate:this.sampleRate}),this.context.state==="suspended"&&await this.context.resume();try{await this.context.audioWorklet.addModule(this.scriptSrc);}catch(t){throw console.error(t),new Error(`Could not add audioWorklet module: ${this.scriptSrc}`)}let e=this.context.createAnalyser();return e.fftSize=8192,e.smoothingTimeConstant=.1,this.analyser=e,!0}getFrequencies(e="frequency",t=-100,s=-30){if(!this.analyser)throw new Error("Not connected, please call .connect() first");return U.getFrequencies(this.analyser,this.sampleRate,null,e,t,s)}_start(){let e=new AudioWorkletNode(this.context,"stream_processor");return e.connect(this.context.destination),e.port.onmessage=t=>{let{event:s}=t.data;if(s==="stop")this.onStop?.(),e.disconnect(),this.stream=null;else if(s==="offset"){let{requestId:n,trackId:r,offset:a}=t.data,i=a/this.sampleRate;this.trackSampleOffsets[n]={trackId:r,offset:a,currentTime:i};}},this.analyser.disconnect(),e.connect(this.analyser),this.stream=e,!0}add16BitPCM(e,t="default"){if(typeof t!="string")throw new Error("trackId must be a string");if(this.interruptedTrackIds[t])return;this.stream||this._start();let s;if(e instanceof Int16Array)s=e;else if(e instanceof ArrayBuffer)s=new Int16Array(e);else throw new Error("argument must be Int16Array or ArrayBuffer");return this.stream.port.postMessage({event:"write",buffer:s,trackId:t}),s}async getTrackSampleOffset(e=!1){if(!this.stream)return null;let t=crypto.randomUUID();this.stream.port.postMessage({event:e?"interrupt":"offset",requestId:t});let s;for(;!s;)s=this.trackSampleOffsets[t],await new Promise(r=>setTimeout(()=>r(),1));let{trackId:n}=s;return e&&n&&(this.interruptedTrackIds[n]=!0),s}async interrupt(){return this.getTrackSampleOffset(!0)}};globalThis.WavStreamPlayer=H;var fe=atom({key:"ThreadIdToResume",default:void 0}),Xe=atom({key:"ResumeThreadErrorState",default:void 0}),de=atom({key:"ChatProfile",default:void 0}),Je=atom({key:"SessionId",default:v4()}),re=selector({key:"SessionIdSelector",get:({get:o})=>o(Je),set:({set:o},e)=>o(Je,e instanceof DefaultValue?v4():e)}),W=atom({key:"Session",dangerouslyAllowMutability:!0,default:void 0}),K=atom({key:"Actions",default:[]}),G=atom({key:"Messages",dangerouslyAllowMutability:!0,default:[]}),Ze=atom({key:"Commands",default:[]}),he=atom({key:"TokenCount",default:0}),J=atom({key:"Loading",default:!1}),Q=atom({key:"AskUser",default:void 0}),pe=atom({key:"WavRecorder",dangerouslyAllowMutability:!0,default:new z}),me=atom({key:"WavStreamPlayer",dangerouslyAllowMutability:!0,default:new H}),ge=atom({key:"AudioConnection",default:"off"}),ye=atom({key:"isAiSpeaking",default:!1}),Se=atom({key:"CallFn",default:void 0}),O=atom({key:"ChatSettings",default:[]}),Re=selector({key:"ChatSettingsValue/Default",get:({get:o})=>o(O).reduce((t,s)=>(t[s.id]=s.initial,t),{})}),j=atom({key:"ChatSettingsValue",default:Re}),Y=atom({key:"DisplayElements",default:[]}),X=atom({key:"TasklistElements",default:[]}),Z=atom({key:"FirstUserInteraction",default:void 0}),et=atom({key:"User",default:void 0}),ke=atom({key:"ChainlitConfig",default:void 0}),tt=atom({key:"AuthConfig",default:void 0}),st=atom({key:"ThreadHistory",default:{threads:void 0,currentThreadId:void 0,timeGroupedThreads:void 0,pageInfo:void 0},effects:[({setSelf:o,onSet:e})=>{e((t,s)=>{let n=t?.timeGroupedThreads;t?.threads&&!isEqual(t.threads,s?.timeGroupedThreads)&&(n=ze(t.threads)),o({...t,timeGroupedThreads:n});});}]}),we=atom({key:"SideView",default:void 0}),ee=atom({key:"CurrentThreadId",default:void 0}),Rt=o=>({setSelf:e,onSet:t})=>{let s=localStorage.getItem(o);if(s!=null)try{e(JSON.parse(s));}catch(n){console.error(`Error parsing localStorage value for key "${o}":`,n);}t((n,r,a)=>{a?localStorage.removeItem(o):localStorage.setItem(o,JSON.stringify(n));});},nt=atom({key:"Mcp",default:[],effects:[Rt("mcp_storage_key")]});var _s=()=>{let o=useRecoilValue(J),e=useRecoilValue(Y),t=useRecoilValue(X),s=useRecoilValue(K),n=useRecoilValue(W),r=useRecoilValue(Q),a=useRecoilValue(Se),i=useRecoilValue(O),f=useRecoilValue(j),m=useRecoilValue(Re),u=n?.socket.connected&&!n?.error,d=!u||o||r?.spec.type==="file"||r?.spec.type==="action"||r?.spec.type==="element";return {actions:s,askUser:r,callFn:a,chatSettingsDefaultValue:m,chatSettingsInputs:i,chatSettingsValue:f,connected:u,disabled:d,elements:e,error:n?.error,loading:o,tasklists:t}};var Rs=o=>{let e=[];for(let t of o)e=R(e,t);return e},Fs=(o,e)=>{if(o.length-1===e)return !0;for(let t=e+1;t<o.length;t++)if(!o[t].streaming)return !1;return !0},R=(o,e)=>Ae(o,e.id)?Ce(o,e.id,e):"parentId"in e&&e.parentId?ot(o,e.parentId,e):"indent"in e&&e.indent&&e.indent>0?rt(o,e.indent,e):[...o,e],rt=(o,e,t,s=0)=>{let n=[...o];if(n.length===0)return [...n,t];{let r=n.length-1,a=n[r];return a.steps=a.steps||[],s+1===e?(a.steps=[...a.steps,t],n[r]={...a},n):(a.steps=rt(a.steps,e,t,s+1),n[r]={...a},n)}},ot=(o,e,t)=>{let s=[...o];for(let n=0;n<s.length;n++){let r=s[n];isEqual(r.id,e)?(r.steps=r.steps?[...r.steps,t]:[t],s[n]={...r}):Ae(s,e)&&r.steps&&(r.steps=ot(r.steps,e,t),s[n]={...r});}return s},at=(o,e)=>{for(let t of o){if(isEqual(t.id,e))return t;if(t.steps&&t.steps.length>0){let s=at(t.steps,e);if(s)return s}}},Ae=(o,e)=>at(o,e)!==void 0,Ce=(o,e,t)=>{let s=[...o];for(let n=0;n<s.length;n++){let r=s[n];isEqual(r.id,e)?s[n]={steps:r.steps,...t}:Ae(s,e)&&r.steps&&(r.steps=Ce(r.steps,e,t),s[n]={...r});}return s},Fe=(o,e)=>{let t=[...o];for(let s=0;s<t.length;s++){let n=t[s];n.id===e?t=[...t.slice(0,s),...t.slice(s+1)]:Ae(t,e)&&n.steps&&(n.steps=Fe(n.steps,e),t[s]={...n});}return t},De=(o,e,t,s,n)=>{let r=[...o];for(let a=0;a<r.length;a++){let i=r[a];isEqual(i.id,e)?("content"in i&&i.content!==void 0?s?i.content=t:i.content+=t:n?"input"in i&&i.input!==void 0&&(s?i.input=t:i.input+=t):"output"in i&&i.output!==void 0&&(s?i.output=t:i.output+=t),r[a]={...i}):i.steps&&(i.steps=De(i.steps,e,t,s,n),r[a]={...i});}return r};var B=()=>{let[o,e]=useRecoilState(tt),[t,s]=useRecoilState(et),n=useSetRecoilState(st);return {authConfig:o,setAuthConfig:e,user:t,setUser:s,setThreadHistory:n}};var Lt=async(o,e)=>(await o.get(e))?.json(),qt=o=>{let e=new se("","webapp");return Object.assign(e,o),e};function te(o,{...e}={}){let t=useContext(L),{setUser:s}=B(),n=useMemo(()=>([a])=>{e.onErrorRetry||(e.onErrorRetry=(...f)=>{let[m]=f;if(m.status===401){s(null);return}return SWRConfig.defaultValue.onErrorRetry(...f)});let i=qt(t);return i.on401=i.onError=void 0,Lt(i,a)},[t]),r=useMemo(()=>o?[o]:null,[o]);return Ut(r,n,e)}var lt=()=>{let{authConfig:o,setAuthConfig:e}=B(),{data:t,isLoading:s}=te(o?null:"/auth/config");return useEffect(()=>{t&&e(t);},[t,e]),{authConfig:o,isLoading:s}};var ut=()=>{let o=useContext(L),{setUser:e,setThreadHistory:t}=B();return {logout:async(n=!1)=>{await o.logout(),e(void 0),t(void 0),n&&window.location.reload();}}};var dt=()=>{let{user:o,setUser:e}=B(),{data:t,error:s,mutate:n}=te("/user");return useEffect(()=>{t&&e(t);},[t,e]),useEffect(()=>{s&&e(null);},[s]),{user:o,setUserFromAPI:n}};var ht=()=>{let{authConfig:o}=lt(),{logout:e}=ut(),{user:t,setUserFromAPI:s}=dt(),n=!!o&&(!o.requireLogin||t!==void 0);return o&&!o.requireLogin?{data:o,user:null,isReady:n,isAuthenticated:!0,logout:()=>Promise.resolve(),setUserFromAPI:()=>Promise.resolve()}:{data:o,user:t,isReady:n,isAuthenticated:!!t,logout:e,setUserFromAPI:s}};var be=class extends Error{constructor(t,s,n){super(t);this.status=s,this.detail=n;}toString(){return this.detail?`${this.message}: ${this.detail}`:this.message}},Ue=class{constructor(e,t,s,n,r){this.httpEndpoint=e;this.type=t;this.additionalQueryParams=s;this.on401=n;this.onError=r;}buildEndpoint(e){let t=`${this.httpEndpoint}${e}`;this.httpEndpoint.endsWith("/")&&(t=`${this.httpEndpoint.slice(0,-1)}${e}`);let s=new URL(t);if(this.additionalQueryParams){let n=new URLSearchParams(this.additionalQueryParams),r=s.search?"&":"?";s.search=s.search+`${r}${n.toString()}`;}return s.toString()}async getDetailFromErrorResponse(e){try{return (await e.json())?.detail}catch(t){console.error("Unable to parse error response",t);}}handleRequestError(e){e instanceof be&&(e.status===401&&this.on401&&this.on401(),this.onError&&this.onError(e)),console.error(e);}async fetch(e,t,s,n,r={}){try{let a;s instanceof FormData?a=s:(r["Content-Type"]="application/json",a=s?JSON.stringify(s):null);let i=await fetch(this.buildEndpoint(t),{method:e,credentials:"include",headers:r,signal:n,body:a});if(!i.ok){let f=await this.getDetailFromErrorResponse(i);throw new be(i.statusText,i.status,f)}return i}catch(a){throw this.handleRequestError(a),a}}async get(e){return await this.fetch("GET",e)}async post(e,t,s){return await this.fetch("POST",e,t,s)}async put(e,t){return await this.fetch("PUT",e,t)}async patch(e,t){return await this.fetch("PATCH",e,t)}async delete(e,t){return await this.fetch("DELETE",e,t)}},se=class extends Ue{async headerAuth(){return (await this.post("/auth/header",{})).json()}async jwtAuth(e){return (await this.fetch("POST","/auth/jwt",void 0,void 0,{Authorization:`Bearer ${e}`})).json()}async stickyCookie(e){return (await this.fetch("POST","/set-session-cookie",{session_id:e})).json()}async passwordAuth(e){return (await this.post("/login",e)).json()}async getUser(){return (await this.get("/user")).json()}async logout(){return (await this.post("/logout",{})).json()}async setFeedback(e){return (await this.put("/feedback",{feedback:e})).json()}async deleteFeedback(e){return (await this.delete("/feedback",{feedbackId:e})).json()}async listThreads(e,t){return (await this.post("/project/threads",{pagination:e,filter:t})).json()}async renameThread(e,t){return (await this.put("/project/thread",{threadId:e,name:t})).json()}async deleteThread(e){return (await this.delete("/project/thread",{threadId:e})).json()}uploadFile(e,t,s,n){let r=new XMLHttpRequest;r.withCredentials=!0;let a=new Promise((i,f)=>{let m=new FormData;m.append("file",e);let u=n?`&ask_parent_id=${n}`:"";r.open("POST",this.buildEndpoint(`/project/file?session_id=${s}${u}`),!0),r.upload.onprogress=function(d){if(d.lengthComputable){let g=d.loaded/d.total*100;t(g);}},r.onload=function(){if(r.status===200){let g=JSON.parse(r.responseText);i(g);return}let d=r.getResponseHeader("Content-Type");if(d&&d.includes("application/json")){let g=JSON.parse(r.responseText);f(g.detail);}else f("Upload failed");},r.onerror=function(){f("Upload error");},r.send(m);});return {xhr:r,promise:a}}async callAction(e,t){return (await this.post("/project/action",{sessionId:t,action:e})).json()}async updateElement(e,t){return (await this.put("/project/element",{sessionId:t,element:e})).json()}async deleteElement(e,t){return (await this.delete("/project/element",{sessionId:t,element:e})).json()}async connectStdioMCP(e,t,s){return (await this.post("/mcp",{sessionId:e,name:t,fullCommand:s,clientType:"stdio"})).json()}async connectSseMCP(e,t,s,n){return (await this.post("/mcp",{sessionId:e,name:t,url:s,...n?{headers:n}:{},clientType:"sse"})).json()}async connectStreamableHttpMCP(e,t,s,n){return (await this.post("/mcp",{sessionId:e,name:t,url:s,...n?{headers:n}:{},clientType:"streamable-http"})).json()}async disconnectMcp(e,t){return (await this.delete("/mcp",{sessionId:e,name:t})).json()}getElementUrl(e,t){let s=`?session_id=${t}`;return this.buildEndpoint(`/project/file/${e}${s}`)}getLogoEndpoint(e,t){return t||this.buildEndpoint(`/logo?theme=${e}`)}getOAuthEndpoint(e){return this.buildEndpoint(`/auth/oauth/${e}`)}};var hn=void 0,L=createContext(new se("http://localhost:8000","webapp"));var pt=()=>{let o=useContext(L),e=useRecoilValue(W),t=useRecoilValue(Q),s=useRecoilValue(re),n=useResetRecoilState(O),r=useResetRecoilState(re),a=useResetRecoilState(j),i=useSetRecoilState(Z),f=useSetRecoilState(J),m=useSetRecoilState(G),u=useSetRecoilState(Y),d=useSetRecoilState(X),g=useSetRecoilState(K),y=useSetRecoilState(he),S=useSetRecoilState(fe),k=useSetRecoilState(we),F=useSetRecoilState(ee),q=useCallback(()=>{e?.socket.emit("clear_session"),e?.socket.disconnect(),S(void 0),r(),i(void 0),m([]),u([]),d([]),g([]),y(0),n(),a(),k(void 0),F(void 0);},[e]),V=useCallback((I,b=[])=>{I.id||(I.id=v4()),I.createdAt||(I.createdAt=new Date().toISOString()),m(D=>R(D,I)),e?.socket.emit("client_message",{message:I,fileReferences:b});},[e?.socket]),x=useCallback(I=>{e?.socket.emit("edit_message",{message:I});},[e?.socket]),ae=useCallback(I=>{e?.socket.emit("window_message",I);},[e?.socket]),ve=useCallback(()=>{e?.socket.emit("audio_start");},[e?.socket]),Te=useCallback((I,b,D,Pe)=>{e?.socket.emit("audio_chunk",{isStart:I,mimeType:b,elapsedTime:D,data:Pe});},[e?.socket]),$=useCallback(()=>{e?.socket.emit("audio_end");},[e?.socket]),N=useCallback(I=>{t&&(t.parentId&&(I.parentId=t.parentId),m(b=>R(b,I)),t.callback(I));},[t]),ie=useCallback(I=>{e?.socket.emit("chat_settings_change",I);},[e?.socket]),ne=useCallback(()=>{m(I=>I.map(b=>(b.streaming=!1,b))),f(!1),e?.socket.emit("stop");},[e?.socket]);return {uploadFile:useCallback((I,b,D)=>o.uploadFile(I,b,s,D),[s]),clear:q,replyMessage:N,sendMessage:V,editMessage:x,windowMessage:ae,startAudioStream:ve,sendAudioChunk:Te,endAudioStream:$,stopTask:ne,setIdToResume:S,updateChatSettings:ie}};var bn=()=>{let o=useRecoilValue(G),e=useRecoilValue(Z);return {threadId:useRecoilValue(ee),messages:o,firstInteraction:e}};var Dn=()=>{let o=useContext(L),e=useRecoilValue(re),[t,s]=useRecoilState(W),n=useSetRecoilState(ye),r=useSetRecoilState(ge),a=useResetRecoilState(j),i=useSetRecoilState(j),f=useSetRecoilState(Z),m=useSetRecoilState(J),u=useSetRecoilState(nt),d=useRecoilValue(me),g=useRecoilValue(pe),y=useSetRecoilState(G),S=useSetRecoilState(Q),k=useSetRecoilState(Se),F=useSetRecoilState(Ze),q=useSetRecoilState(we),V=useSetRecoilState(Y),x=useSetRecoilState(X),ae=useSetRecoilState(K),ve=useSetRecoilState(O),Te=useSetRecoilState(he),[$,N]=useRecoilState(de),ie=useSetRecoilState(ke),ne=useRecoilValue(fe),Ne=useSetRecoilState(Xe),[I,b]=useRecoilState(ee);useEffect(()=>{t?.socket&&(t.socket.auth.threadId=I||"");},[I]);let D=useCallback(async({transports:yt,userEnv:St})=>{let{protocol:kt,host:wt,pathname:_e}=new URL(o.httpEndpoint),It=`${kt}//${wt}`,At=_e&&_e!=="/"?`${_e}/ws/socket.io`:"/ws/socket.io";try{await o.stickyCookie(e);}catch(c){console.error(`Failed to set sticky session cookie: ${c}`);}let p=Gt(It,{path:At,withCredentials:!0,transports:yt,auth:{clientType:o.type,sessionId:e,threadId:ne||"",userEnv:JSON.stringify(St),chatProfile:$?encodeURIComponent($):""}});s(c=>(c?.socket?.removeAllListeners(),c?.socket?.close(),{socket:p})),p.on("connect",()=>{p.emit("connection_successful"),s(c=>({...c,error:!1})),u(c=>c.map(l=>{let h;return l.clientType==="sse"?h=o.connectSseMCP(e,l.name,l.url):l.clientType==="streamable-http"?h=o.connectStreamableHttpMCP(e,l.name,l.url):h=o.connectStdioMCP(e,l.name,l.command),h.then(async({success:A,mcp:v})=>{u(Ee=>Ee.map(ce=>ce.name===v.name?{...ce,status:A?"connected":"failed",tools:v?v.tools:ce.tools}:ce));}).catch(()=>{u(A=>A.map(v=>v.name===l.name?{...v,status:"failed"}:v));}),{...l,status:"connecting"}}));}),p.on("connect_error",c=>{s(l=>({...l,error:!0}));}),p.on("task_start",()=>{m(!0);}),p.on("task_end",()=>{m(!1);}),p.on("reload",()=>{p.emit("clear_session"),window.location.reload();}),p.on("audio_connection",async c=>{if(c==="on"){let l=!0,h=Date.now(),A="pcm16";await g.begin(),await d.connect(),await g.record(async v=>{let Ee=Date.now()-h;p.emit("audio_chunk",{isStart:l,mimeType:A,elapsedTime:Ee,data:v.mono}),l=!1;}),d.onStop=()=>n(!1);}else await g.end(),await d.interrupt();r(c);}),p.on("audio_chunk",c=>{d.add16BitPCM(c.data,c.track),n(!0);}),p.on("audio_interrupt",()=>{d.interrupt();}),p.on("resume_thread",c=>{let l=[];for(let A of c.steps)l=R(l,A);c.metadata?.chat_profile&&N(c.metadata?.chat_profile),c.metadata?.chat_settings&&i(c.metadata?.chat_settings),y(l);let h=c.elements||[];x(h.filter(A=>A.type==="tasklist")),V(h.filter(A=>["avatar","tasklist"].indexOf(A.type)===-1));}),p.on("resume_thread_error",c=>{Ne(c);}),p.on("new_message",c=>{y(l=>R(l,c));}),p.on("first_interaction",c=>{f(c.interaction),b(c.thread_id);}),p.on("update_message",c=>{y(l=>Ce(l,c.id,c));}),p.on("delete_message",c=>{y(l=>Fe(l,c.id));}),p.on("stream_start",c=>{y(l=>R(l,c));}),p.on("stream_token",({id:c,token:l,isSequence:h,isInput:A})=>{y(v=>De(v,c,l,h,A));}),p.on("ask",({msg:c,spec:l},h)=>{S({spec:l,callback:h,parentId:c.parentId}),y(A=>R(A,c)),m(!1);}),p.on("ask_timeout",()=>{S(void 0),m(!1);}),p.on("clear_ask",()=>{S(void 0);}),p.on("call_fn",({name:c,args:l},h)=>{k({name:c,args:l,callback:h});}),p.on("clear_call_fn",()=>{k(void 0);}),p.on("call_fn_timeout",()=>{k(void 0);}),p.on("chat_settings",c=>{ve(c),a();}),p.on("set_commands",c=>{F(c);}),p.on("set_sidebar_title",c=>{q(l=>l?.title===c?l:{title:c,elements:l?.elements||[]});}),p.on("set_sidebar_elements",({elements:c,key:l})=>{c.length?(c.forEach(h=>{!h.url&&h.chainlitKey&&(h.url=o.getElementUrl(h.chainlitKey,e));}),q(h=>h?.key===l?h:{title:h?.title||"",elements:c,key:l})):q(void 0);}),p.on("element",c=>{!c.url&&c.chainlitKey&&(c.url=o.getElementUrl(c.chainlitKey,e)),c.type==="tasklist"?x(l=>{let h=l.findIndex(A=>A.id===c.id);return h===-1?[...l,c]:[...l.slice(0,h),c,...l.slice(h+1)]}):V(l=>{let h=l.findIndex(A=>A.id===c.id);return h===-1?[...l,c]:[...l.slice(0,h),c,...l.slice(h+1)]});}),p.on("remove_element",c=>{V(l=>l.filter(h=>h.id!==c.id)),x(l=>l.filter(h=>h.id!==c.id));}),p.on("action",c=>{ae(l=>[...l,c]);}),p.on("remove_action",c=>{ae(l=>{let h=l.findIndex(A=>A.id===c.id);return h===-1?l:[...l.slice(0,h),...l.slice(h+1)]});}),p.on("token_usage",c=>{Te(l=>l+c);}),p.on("window_message",c=>{window.parent&&window.parent.postMessage(c,"*");}),p.on("toast",c=>{if(!c.message){console.warn("No message received for toast.");return}switch(c.type){case"info":toast.info(c.message);break;case"error":toast.error(c.message);break;case"success":toast.success(c.message);break;case"warning":toast.warning(c.message);break;default:toast(c.message);break}}),p.on("chat_profile_changed",c=>{N(l=>l===c?l:c);}),p.on("refresh_settings",()=>{ie(void 0);});},[s,e,ne,$,N,ie]),Pe=useCallback(debounce(D,200),[D]),gt=useCallback(()=>{t?.socket&&(t.socket.removeAllListeners(),t.socket.close());},[t]);return {connect:Pe,disconnect:gt,session:t,sessionId:e,chatProfile:$,idToResume:ne,setChatProfile:N}};var On=()=>{let[o,e]=useRecoilState(ge),t=useRecoilValue(pe),s=useRecoilValue(me),n=useRecoilValue(ye),{startAudioStream:r,endAudioStream:a}=pt(),i=useCallback(async()=>{e("connecting"),await r();},[r]),f=useCallback(async()=>{e("off"),await t.end(),await s.interrupt(),await a();},[a,t,s]);return {startConversation:i,endConversation:f,audioConnection:o,isAiSpeaking:n,wavRecorder:t,wavStreamPlayer:s}};var Wn=()=>{let[o,e]=useRecoilState(ke),{isAuthenticated:t}=ht(),s=useRecoilValue(de),n=navigator.language||"en-US",r=t?`/project/settings?language=${n}${s?`&chat_profile=${encodeURIComponent(s)}`:""}`:null,{data:a,error:i,isLoading:f}=te(r);return useEffect(()=>{a&&e(a);},[a,e]),{config:o,error:i,isLoading:f,language:n}};var $e=new WeakMap,Zt=(o,e,t=!1,s=!1)=>{let n,r,a;if(s&&(r=e.toString(),a=t.toString(),n=$e.has(o)?$e.get(o):{},$e.set(o,n),n[r]=n[r]||{},n[r][a]))return n[r][a];let i=o.length,f=new Array(e);if(e<=i){f.fill(0);let m=new Array(e).fill(0);for(let u=0;u<i;u++){let d=Math.floor(u*(e/i));t?f[d]=Math.max(f[d],Math.abs(o[u])):f[d]+=Math.abs(o[u]),m[d]++;}if(!t)for(let u=0;u<f.length;u++)f[u]=f[u]/m[u];}else for(let m=0;m<e;m++){let u=m*(i-1)/(e-1),d=Math.floor(u),g=Math.ceil(u),y=u-d;g>=i?f[m]=o[i-1]:f[m]=o[d]*(1-y)+o[g]*y;}return s&&(n[r][a]=f),f},es={drawBars:(o,e,t,s,n,r=0,a=0,i=0,f=!1)=>{r=Math.floor(Math.min(r,(t-i)/(Math.max(a,1)+i))),r||(r=Math.floor((t-i)/(Math.max(a,1)+i))),a||(a=(t-i)/r-i);let m=Zt(e,r,!0);for(let u=0;u<r;u++){let d=Math.abs(m[u]),g=Math.max(1,d*s),y=i+u*(a+i),S=f?(s-g)/2:s-g,k=Math.min(a/2,g/2);o.fillStyle=n,o.beginPath(),o.moveTo(y+k,S),o.lineTo(y+a-k,S),o.arcTo(y+a,S,y+a,S+k,k),o.lineTo(y+a,S+g-k),o.arcTo(y+a,S+g,y+a-k,S+g,k),o.lineTo(y+k,S+g),o.arcTo(y,S+g,y,S+g-k,k),o.lineTo(y,S+k),o.arcTo(y,S,y+k,S,k),o.closePath(),o.fill();}}};

export { Ue as APIBase, se as ChainlitAPI, L as ChainlitContext, be as ClientError, es as WavRenderer, K as actionState, R as addMessage, ot as addMessageToParent, Q as askUserState, ge as audioConnectionState, tt as authState, Se as callFnState, de as chatProfileState, Re as chatSettingsDefaultValueSelector, O as chatSettingsInputsState, j as chatSettingsValueState, Ze as commandsState, ke as configState, ee as currentThreadIdState, hn as defaultChainlitContext, Fe as deleteMessageById, Y as elementState, Lt as fetcher, Z as firstUserInteraction, Ae as hasMessageById, ye as isAiSpeakingState, Fs as isLastMessage, J as loadingState, nt as mcpState, G as messagesState, Rs as nestMessages, Xe as resumeThreadErrorState, re as sessionIdState, W as sessionState, we as sideViewState, X as tasklistState, st as threadHistoryState, fe as threadIdToResumeState, he as tokenCountState, Ce as updateMessageById, De as updateMessageContentById, te as useApi, On as useAudio, ht as useAuth, _s as useChatData, pt as useChatInteract, bn as useChatMessages, Dn as useChatSession, Wn as useConfig, et as userState, pe as wavRecorderState, me as wavStreamPlayerState };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index.mjs.map